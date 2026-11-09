/**
 * Pre-generate single-use claim codes (spec §Claim flow).
 * Usage: npm run claims:gen -- --n 10 --amount 1000
 */
import { generateClaimCode } from '../src/claims.js'
import { DEFAULT_CLAIM_AMOUNT, loadConfig } from '../src/config.js'
import { openStore } from '../src/store.js'

function arg(name: string, def: number): number {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1 || !process.argv[i + 1]) return def
  return Number(process.argv[i + 1]) || def
}

const n = Math.min(arg('n', 10), 1000)
const amount = Math.max(arg('amount', DEFAULT_CLAIM_AMOUNT), 1)

const config = loadConfig()
const store = openStore(config.dbPath, config.allowJsonStore)
for (let i = 0; i < n; i++) {
  const code = generateClaimCode()
  store.insertClaim(code, amount)
  console.log(code)
}
store.close()
console.error(`[claims] generated ${n} code(s) of ${amount} each (store: ${config.dbPath})`)
