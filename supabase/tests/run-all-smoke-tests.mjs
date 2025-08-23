import { spawn } from 'child_process'
import { createWriteStream } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const tests = [
  'employee-smoke-test.mjs',
  'svj-smoke-test.mjs',
  'user-notes-smoke-test.mjs',
  'dynamic-variables-smoke-test.mjs',
  'pdf-templates-smoke-test.mjs',
  'email-templates-smoke-test.mjs',
  'communication-campaigns-smoke-test.mjs',
  'notifications-smoke-test.mjs',
  'user-profiles-smoke-test.mjs'
]

const out = createWriteStream(path.join(__dirname, 'results.log'), { flags: 'a' })

async function runTest(file) {
  return new Promise((resolve) => {
    const p = spawn('node', [path.join(__dirname, file)], { stdio: ['ignore', 'pipe', 'pipe'] })
    out.write(`\n=== START ${file} at ${new Date().toISOString()} ===\n`)
    p.stdout.on('data', d => out.write(d))
    p.stderr.on('data', d => out.write(d))
    p.on('close', code => {
      out.write(`=== END ${file} (code=${code}) at ${new Date().toISOString()} ===\n`)
      resolve({ file, code })
    })
  })
}

async function runAll() {
  out.write(`\nRUN ALL SMOKE TESTS at ${new Date().toISOString()}\n`)
  for (const t of tests) {
    // run sequentially
    // eslint-disable-next-line no-await-in-loop
    const r = await runTest(t)
    console.log(`Finished ${r.file} -> code=${r.code}`)
  }
  out.end()
}

runAll()
