/* eslint-disable no-console */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Project, SyntaxKind } from 'ts-morph'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- CONFIG ---------------------------------------------------------

// Only these files may do low-level HTTP (e.g., your central wrapper)
const WHITELIST_FILES = new Set<string>([
  normal('src/services/api-client.ts'),
  // normal('src/another-allowed-wrapper.ts'),
])

// Folders to ignore during scan
const IGNORE_DIRS = ['node_modules', 'dist', 'build', 'public', '.git', '.vite']

// File globs to scan (adjust if you keep code in different roots)
let INCLUDE_GLOBS = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'scripts/**/*.ts',
  '!**/*.d.ts',
]

// -------------------------------------------------------------------

// --- TEST OVERRIDES ------------------------------------------------
// Allow tests to restrict the scan set and whitelist via env vars.
// AUDIT_GLOBS: comma-separated list of globs (e.g. "scripts/audit-fixtures/**/*.ts")
// AUDIT_WHITELIST_FILES: comma-separated file list (posix paths)
if (process.env.AUDIT_GLOBS) {
  ;(INCLUDE_GLOBS as unknown as string[]) = process.env.AUDIT_GLOBS.split(',').map(s => s.trim()).filter(Boolean)
}
if (process.env.AUDIT_WHITELIST_FILES) {
  for (const f of process.env.AUDIT_WHITELIST_FILES.split(',').map(s => s.trim()).filter(Boolean)) {
    WHITELIST_FILES.add(normal(f))
  }
}

// --- ADD below your CONFIG section ---------------------------------

const ALLOWED_HOSTS: RegExp[] = [
  /(^|\.)supabase\.co$/i, // only Supabase by default
]

// Accepts:  // allow-external:api.example.com
function hasInlineAllowExternal(sfText: string, pos: number, host: string) {
  // get the line that contains `pos`
  const before = sfText.slice(0, pos)
  const lineStart = before.lastIndexOf('\n') + 1
  const lineEnd = sfText.indexOf('\n', pos) === -1 ? sfText.length : sfText.indexOf('\n', pos)
  const line = sfText.slice(lineStart, lineEnd)
  const m = line.match(/allow-external:([A-Za-z0-9.\-]+)/)
  return !!m && m[1] === host
}

// Try to extract the first argument URL of fetch(...) if string-like.
// Supports string literals and **static** template literals (no vars).
function getFetchUrlFromCall(call: import('ts-morph').CallExpression): string | null {
  const args = call.getArguments()
  if (!args.length) return null
  const a0 = args[0]

  // "https://..."; 'https://...'
  if (a0.getKind() === SyntaxKind.StringLiteral) {
    // @ts-ignore
    return a0.getLiteralValue()
  }

  // `https://...`  (reject if contains ${})
  if (a0.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
    return a0.getText().slice(1, -1) // strip backticks
  }

  // Template with substitutions → cannot statically validate
  // treat as unknown → return null (no decision here)
  return null
}

function isHostAllowed(host: string) {
  return ALLOWED_HOSTS.some((re) => re.test(host))
}

function urlHost(u: string): string | null {
  try { return new URL(u).host } catch { return null }
}

// Extract URL from axios call if the first argument is a string-like literal.
// Supports: axios("https://..."), axios.get("https://..."), axios.post("https://...", body)
function getAxiosUrlFromCall(call: import('ts-morph').CallExpression): string | null {
  const args = call.getArguments()
  if (!args.length) return null
  const a0 = args[0]

  // "https://..."; 'https://...'
  if (a0.getKind() === SyntaxKind.StringLiteral) {
    // @ts-ignore
    return a0.getLiteralValue()
  }

  // `https://...`  (no substitutions)
  if (a0.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
    return a0.getText().slice(1, -1)
  }

  // dynamic URL → cannot statically validate
  return null
}

// Warn if the first argument is dynamic (not a plain string/template literal)
function isDynamicUrlWarn(call: import('ts-morph').CallExpression): boolean {
  const args = call.getArguments()
  if (!args.length) return false
  const a0 = args[0]

  // Dynamic if not StringLiteral or NoSubstitutionTemplateLiteral
  return !(
    a0.getKind() === SyntaxKind.StringLiteral ||
    a0.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral
  )
}

function hasInlineAllowDynamic(sfText: string, pos: number) {
  const before = sfText.slice(0, pos)
  const lineStart = before.lastIndexOf('\n') + 1
  const lineEnd = sfText.indexOf('\n', pos) === -1 ? sfText.length : sfText.indexOf('\n', pos)
  const line = sfText.slice(lineStart, lineEnd)
  return line.includes('allow-dynamic-url')
}


function normal(p: string) {
  return path.normalize(p).replace(/\\/g, '/')
}

function isIgnored(filePath: string) {
  const n = normal(filePath)
  for (const dir of IGNORE_DIRS) {
    if (n.includes(`/${dir}/`)) return true
  }
  return false
}

function isWhitelisted(filePath: string) {
  const n = normal(filePath)
  // allow either exact match or path suffix match so both absolute and relative paths work
  for (const w of WHITELIST_FILES) {
    if (n === w) return true
    if (n.endsWith('/' + w)) return true
  }
  return false
}

function posInfo(node: any, sourceFile: any) {
  try {
    if (typeof node.getStartLineNumber === 'function') {
      const line = node.getStartLineNumber()
      const col = typeof node.getStartColumnNumber === 'function' ? node.getStartColumnNumber() : 0
      return { line, column: col }
    }
    if (typeof node.getStart === 'function' && typeof sourceFile.getLineAndColumnAtPos === 'function') {
      const pos = node.getStart()
      const lc = sourceFile.getLineAndColumnAtPos(pos)
      return { line: lc.line, column: lc.column }
    }
  } catch (e) {
    // fallthrough
  }
  return { line: 0, column: 0 }
}

async function main() {
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })

  INCLUDE_GLOBS.forEach(g => project.addSourceFilesAtPaths(g))

  const violations: Array<{ file: string; line: number; col: number; msg: string }> = []

  for (const sf of project.getSourceFiles()) {
    const filePath = normal(sf.getFilePath())
    if (isIgnored(filePath)) continue
    const whitelisted = isWhitelisted(filePath)

    // 1) Detect axios import anywhere
    const hasAxiosImport = sf.getImportDeclarations().some(imp => {
      const n = imp.getModuleSpecifierValue()
      return n === 'axios' || n.startsWith('axios/')
    })
      if (hasAxiosImport && !whitelisted) {
        const node = sf.getImportDeclarations().find(imp => {
          const n = imp.getModuleSpecifierValue()
          return n === 'axios' || n.startsWith('axios/')
        })!
        const pos = posInfo(node, sf)
        violations.push({
          file: filePath,
          line: pos.line || 1,
          col: pos.column || 1,
          msg: 'Axios import is forbidden outside whitelist.',
        })
      }

    // 2) Detect axios(...) and axios.<method>(...) calls
    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.CallExpression) return
      const call = node.asKind(SyntaxKind.CallExpression)!
      const expr = call.getExpression()

      // axios(...)
      if (expr.getText() === 'axios') {
  const pos = posInfo(call, sf)
  const line = pos.line || 1
  const column = pos.column || 1
        const fileText = sf.getFullText()
        const startPos = call.getStart()

        if (!whitelisted) {
          violations.push({
            file: filePath,
            line: line + 1,
            col: column + 1,
            msg: 'axios() call is forbidden outside whitelist.',
          })
          return
        }

        // whitelisted file → enforce allowed host (if URL literal)
        const url = getAxiosUrlFromCall(call)
        if (!url) {
          // Dynamic URL → violation unless annotated
          const pinfo = posInfo(call, sf)
          const fileText2 = sf.getFullText()
          if (fileText2.includes('// allow-dynamic-url')) return
          violations.push({
            file: filePath,
            line: pinfo.line || 1,
            col: pinfo.column || 1,
            msg: 'Dynamic URL in fetch/axios is forbidden. Use literal Supabase endpoints or add // allow-dynamic-url with justification.',
          })
          return
        }

        const host = urlHost(url)
        if (!host) {
          violations.push({
            file: filePath,
            line: line + 1,
            col: column + 1,
            msg: 'axios() URL is not a valid absolute URL.',
          })
          return
        }

        if (isHostAllowed(host)) return
        if (hasInlineAllowExternal(fileText, startPos, host)) return

        violations.push({
          file: filePath,
          line: line + 1,
          col: column + 1,
          msg: `axios() URL host "${host}" is not allowed (only *.supabase.co by default). Add inline: // allow-external:${host}`,
        })
      }

      // axios.get/post/put/delete/...
      if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
        const p = expr.asKind(SyntaxKind.PropertyAccessExpression)!
        if (p.getExpression().getText() !== 'axios') return

  const pos = posInfo(call, sf)
  const line = pos.line || 1
  const column = pos.column || 1
        const fileText = sf.getFullText()
        const startPos = call.getStart()

        if (!whitelisted) {
          violations.push({
            file: filePath,
            line: line + 1,
            col: column + 1,
            msg: `axios.${p.getName()} call is forbidden outside whitelist.`,
          })
          return
        }

        // whitelisted file → enforce allowed host (if URL literal)
        const url = getAxiosUrlFromCall(call)
        if (!url) {
          // Dynamic URL → violation unless annotated
          const pinfo = posInfo(call, sf)
          const fileText2 = sf.getFullText()
          if (fileText2.includes('// allow-dynamic-url')) return
          violations.push({
            file: filePath,
            line: pinfo.line || 1,
            col: pinfo.column || 1,
            msg: 'Dynamic URL in fetch/axios is forbidden. Use literal Supabase endpoints or add // allow-dynamic-url with justification.',
          })
          return
        }

        const host = urlHost(url)
        if (!host) {
          violations.push({
            file: filePath,
            line: line + 1,
            col: column + 1,
            msg: `axios.${p.getName()} URL is not a valid absolute URL.`,
          })
          return
        }

        if (isHostAllowed(host)) return
        if (hasInlineAllowExternal(fileText, startPos, host)) return

        violations.push({
          file: filePath,
          line: line + 1,
          col: column + 1,
          msg: `axios.${p.getName()} URL host "${host}" is not allowed (only *.supabase.co by default). Add inline: // allow-external:${host}`,
        })
      }
    })

    // 3) Detect global fetch(...) calls (forbidden outside whitelist)
    //    and enforce allowed hostnames when URL is a literal.
    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.CallExpression) return
      const call = node.asKind(SyntaxKind.CallExpression)!
      const expr = call.getExpression()
      if (expr.getText() !== 'fetch') return

      const pos = posInfo(call, sf)
      const startPos = call.getStart()
      const text = sf.getFullText()

      // If the file is NOT whitelisted, report direct fetch usage
      if (!whitelisted) {
        violations.push({
          file: filePath,
          line: pos.line || 1,
          col: pos.column || 1,
          msg: 'fetch() call is forbidden outside whitelist.',
        })
        return
      }

      // File is whitelisted (e.g., api-client.ts) → enforce domain whitelist
      const maybeUrl = getFetchUrlFromCall(call)
      if (!maybeUrl) return // dynamic URL — skip strict host validation

      const host = urlHost(maybeUrl)
      if (!host) {
        violations.push({
          file: filePath,
          line: pos.line || 1,
          col: pos.column || 1,
          msg: 'fetch() URL is not a valid absolute URL.',
        })
        return
      }

      if (isHostAllowed(host)) return

      // Inline escape hatch: // allow-external:example.com
      if (hasInlineAllowExternal(text, startPos, host)) return

      violations.push({
        file: filePath,
        line: pos.line || 1,
        col: pos.column || 1,
        msg: `fetch() URL host "${host}" is not allowed (only *.supabase.co by default). Add an inline comment: // allow-external:${host} (with review).`,
      })
    })
  }

  if (violations.length) {
    console.error('Supabase Guard (AST): violations found:')
    for (const v of violations) {
      console.error(`${v.file}:${v.line}:${v.col}  ${v.msg}`)
    }
    process.exit(1)
  } else {
    console.log('Supabase Guard (AST): OK — no forbidden fetch/axios usages.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
