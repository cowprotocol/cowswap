/**
 * Pre-generate single-use claim codes (spec §Claim flow).
 * Usage: npm run claims:gen -- --n 10 --amount 1000 --out data/codes.txt
 */
import fs from 'node:fs'
import path from 'node:path'

import { generateClaimCode } from '../src/claims.js'
import { DEFAULT_CLAIM_AMOUNT, loadConfig, PKG_ROOT } from '../src/config.js'
import { openStore } from '../src/store.js'

function arg(name: string, def: number): number {
  const raw = textArg(name)
  return raw === null ? def : Number(raw) || def
}

function textArg(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1 || !process.argv[i + 1]) return null
  return process.argv[i + 1] ?? null
}

const n = Math.min(arg('n', 10), 1000)
const amount = Math.max(arg('amount', DEFAULT_CLAIM_AMOUNT), 1)

const out = textArg('out')
const config = loadConfig()
const store = openStore(config.dbPath, config.allowJsonStore)
const codes: string[] = []

for (let i = 0; i < n; i++) {
  const code = generateClaimCode()
  store.insertClaim(code, amount)
  codes.push(code)
}

store.close()

// Both npm and pnpm print their script banner to stdout, so a shell redirect
// captures those lines as if they were codes; --out writes the file directly.
if (out) {
  const file = path.isAbsolute(out) ? out : path.resolve(PKG_ROOT, out)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${codes.join('\n')}\n`)
  console.error(`[claims] wrote ${file}`)
} else {
  console.log(codes.join('\n'))
}

console.error(`[claims] generated ${n} code(s) of ${amount} each (store: ${config.dbPath})`)
