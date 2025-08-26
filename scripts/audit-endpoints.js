/* eslint-env node */
// Simple audit script to find direct `fetch(` and `axios` usage outside of allowed files.
// Exits with code 1 if disallowed usages are found.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const allowed = [
  'src/services/api-client.ts',
  // allow CI/scripts and workflow files
  'scripts/',
  '.github/',
]

function isAllowed(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/')
  return allowed.some(a => rel === a || rel.startsWith(a))
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let results = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      // skip common large or external folders
      if (['node_modules', 'dist', 'public', '.git', '.vite', 'build'].includes(e.name)) continue
      results = results.concat(walk(p))
    } else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) {
      results.push(p)
    }
  }
  return results
}

const files = walk(root)
const violations = []
for (const f of files) {
  if (isAllowed(f)) continue
  const content = fs.readFileSync(f, 'utf8')
  // look for fetch( or axios(. Naive but effective for CI check.
  const lines = content.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (/\bfetch\s*\(/.test(l) || /\baxios\s*\./.test(l)) {
      violations.push({ file: path.relative(root, f), line: i + 1, text: l.trim() })
    }
  }
}

if (violations.length) {
  console.error('Supabase Guard: Disallowed direct fetch/axios usages found:')
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}: ${v.text}`)
  }
  console.error('\nAllowed locations:')
  for (const a of allowed) console.error('  ' + a)
  process.exit(1)
} else {
  console.log('Supabase Guard: no direct fetch/axios usages found outside whitelist.')
  process.exit(0)
}
