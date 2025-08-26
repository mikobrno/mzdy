/* eslint-env node */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const audit = resolve(__dirname, 'audit-endpoints.ts')
const fixturesGlob = 'scripts/audit-fixtures/**/*.ts'

function run(name, env = {}) {
  return new Promise((resolvePromise) => {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const full = `${cmd} tsx ${JSON.stringify(audit)}`
    const res = spawnSync(full, { shell: true, env: { ...process.env, ...env } })
    const code = res.status === null ? 1 : res.status
    const stdout = res.stdout ? res.stdout.toString() : ''
    const stderr = res.stderr ? res.stderr.toString() : ''
    resolvePromise({ name, code, stdout, stderr })
  })
}

const tests = [
  {
    name: 'FAIL: fetch in non-whitelisted file',
    env: {
      AUDIT_GLOBS: fixturesGlob,
      AUDIT_WHITELIST_FILES: 'scripts/audit-fixtures/api-client-ok.ts',
    },
    expectCode: 1, // non-whitelisted.ts has fetch → should fail
  },
  {
    name: 'PASS: whitelisted client with literal supabase fetch',
    env: {
      AUDIT_GLOBS: 'scripts/audit-fixtures/api-client-ok.ts',
      AUDIT_WHITELIST_FILES: 'scripts/audit-fixtures/api-client-ok.ts',
    },
    expectCode: 0,
  },
  {
    name: 'FAIL: whitelisted client external literal without allow-external',
    env: {
      AUDIT_GLOBS: 'scripts/audit-fixtures/api-client-external.ts',
      AUDIT_WHITELIST_FILES: 'scripts/audit-fixtures/api-client-external.ts',
    },
    expectCode: 1,
  },
  // Uncomment this test only if you enabled the inline allow-external in fixture:
  // {
  //   name: 'PASS: whitelisted client external literal with // allow-external',
  //   env: {
  //     AUDIT_GLOBS: 'scripts/audit-fixtures/api-client.ts',
  //     AUDIT_WHITELIST_FILES: 'scripts/audit-fixtures/api-client.ts',
  //   },
  //   expectCode: 0,
  // },
  {
    name: 'PASS: whitelisted client dynamic fetch with // allow-dynamic-url',
    env: {
      AUDIT_GLOBS: 'scripts/audit-fixtures/api-client-dynamic.ts',
      AUDIT_WHITELIST_FILES: 'scripts/audit-fixtures/api-client-dynamic.ts',
    },
    expectCode: 0,
  },
  // Axios cases (only if axios installed). If not present, comment out both:
  {
    name: 'FAIL: axios import/call in non-whitelisted file',
    env: {
      AUDIT_GLOBS: 'scripts/audit-fixtures/axios-bad.ts',
      AUDIT_WHITELIST_FILES: 'scripts/audit-fixtures/api-client.ts',
    },
    expectCode: 1,
  },
  {
    name: 'PASS: axios allowed host in whitelisted file',
    env: {
      AUDIT_GLOBS: 'scripts/audit-fixtures/axios-ok.ts',
      AUDIT_WHITELIST_FILES: 'scripts/audit-fixtures/axios-ok.ts',
    },
    expectCode: 0,
  },
]

let fails = 0
for (const t of tests) {
  // eslint-disable-next-line no-await-in-loop
  const res = await run(t.name, t.env)
  const ok = res.code === t.expectCode
  console.log(`\n[${ok ? 'OK' : 'FAIL'}] ${t.name}`)
  if (!ok) {
    console.log('  Expected exit:', t.expectCode, ' got:', res.code)
    console.log('  --- stdout ---\n' + res.stdout.trim())
    console.log('  --- stderr ---\n' + res.stderr.trim())
    fails++
  }
}

if (fails) {
  console.error(`\nAudit tests: ${fails} failing case(s).`)
  process.exit(1)
} else {
  console.log('\nAudit tests: all cases passed.')
}
