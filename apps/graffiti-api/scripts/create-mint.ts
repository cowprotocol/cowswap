/**
 * Devnet token setup for the Graffiti Wall (spec §Token ops).
 *
 * Creates:
 *   - a new SPL mint (decimals: 0)
 *   - treasury keypair + its ATA
 *   - initial supply of 1_000_000 tokens minted to the treasury
 *
 * Keypairs are written to apps/graffiti-api/.keys/ (gitignored, mode 0600).
 * Prints MINT and TREASURY pubkeys for the server env (MINT / TREASURY_KEYPAIR).
 *
 * Usage: pnpm --filter @cowprotocol/graffiti-api run mint:create [-- --rpc https://api.devnet.solana.com]
 */
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, type PublicKey } from '@solana/web3.js'

import fs from 'node:fs'
import path from 'node:path'

import { INITIAL_SUPPLY, PKG_ROOT } from '../src/config.js'
import { errorMessage } from '../src/util.js'

const KEYS_DIR = path.resolve(PKG_ROOT, '.keys')
const MIN_TREASURY_LAMPORTS = LAMPORTS_PER_SOL
const AIRDROP_LAMPORTS = 2 * LAMPORTS_PER_SOL

async function createToken(connection: Connection, treasury: Keypair, mint: Keypair): Promise<PublicKey> {
  console.log('[mint] Creating mint (decimals: 0) ...')
  const mintPubkey = await createMint(
    connection,
    treasury, // payer
    treasury.publicKey, // mint authority
    null, // freeze authority
    0, // decimals
    mint,
    undefined,
    TOKEN_PROGRAM_ID,
  )

  console.log('[mint] Creating treasury ATA ...')
  const treasuryAta = await getOrCreateAssociatedTokenAccount(
    connection,
    treasury,
    mintPubkey,
    treasury.publicKey,
    false,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID,
  )

  console.log(`[mint] Minting initial supply (${INITIAL_SUPPLY.toLocaleString()} units) ...`)
  await mintTo(
    connection,
    treasury,
    mintPubkey,
    treasuryAta.address,
    treasury,
    INITIAL_SUPPLY,
    [],
    undefined,
    TOKEN_PROGRAM_ID,
  )
  return mintPubkey
}

/** Returns false (after telling the operator what to do) when the treasury cannot be funded. */
async function ensureFunded(connection: Connection, treasury: Keypair): Promise<boolean> {
  if ((await connection.getBalance(treasury.publicKey)) >= MIN_TREASURY_LAMPORTS) return true

  console.log(`[mint] Requesting 2 SOL devnet airdrop for treasury ${treasury.publicKey.toBase58()} ...`)
  try {
    const signature = await connection.requestAirdrop(treasury.publicKey, AIRDROP_LAMPORTS)
    const latest = await connection.getLatestBlockhash()
    await connection.confirmTransaction({ signature, ...latest }, 'confirmed')
    return true
  } catch (err: unknown) {
    // The public devnet RPC faucet is closed (410) since late 2025; the web
    // faucet at https://faucet.solana.com requires a captcha.
    console.error(`\n[mint] airdrop failed: ${errorMessage(err)}`)
    console.error(`[mint] Fund this treasury address with devnet SOL manually:`)
    console.error(`        ${treasury.publicKey.toBase58()}`)
    console.error(`      (https://faucet.solana.com — captcha, one-time) then re-run the script.`)
    return false
  }
}

/** Reuse existing keypairs so the script can be re-run after a manual funding. */
function loadOrGenerate(name: string): Keypair {
  const file = path.join(KEYS_DIR, name)
  if (!fs.existsSync(file)) return Keypair.generate()

  const keypair = readKeypair(file)
  console.log(`[mint] reusing existing ${name}: ${keypair.publicKey.toBase58()}`)
  return keypair
}

async function main(): Promise<void> {
  const rpcUrl = resolveRpcUrl(process.argv.slice(2))
  console.log(`[mint] RPC: ${rpcUrl}`)

  const connection = new Connection(rpcUrl, 'confirmed')
  const treasury = resolveTreasury()
  const mint = loadOrGenerate('mint.json')

  // Persist before any network call so a failed funding step can be resumed.
  saveKeys(mint, treasury)

  if (!(await ensureFunded(connection, treasury))) process.exit(1)

  const mintPubkey = await createToken(connection, treasury, mint)
  printSummary(mintPubkey, treasury)
}

function printSummary(mint: PublicKey, treasury: Keypair): void {
  console.log('')
  console.log('=========================================')
  console.log(`MINT     = ${mint.toBase58()}`)
  console.log(`TREASURY = ${treasury.publicKey.toBase58()}`)
  console.log('=========================================')
  console.log('Keypairs saved to .keys/mint.json and .keys/treasury.json (gitignored, mode 0600).')
  console.log('Run the API with:')
  console.log(`  MINT=${mint.toBase58()} TREASURY_KEYPAIR=${path.join(KEYS_DIR, 'treasury.json')} \\`)
  console.log('  ADMIN_TOKEN=<secret> pnpm --filter @cowprotocol/graffiti-api run dev')
}

function readKeypair(file: string): Keypair {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(file, 'utf8')) as number[]))
}

function resolveRpcUrl(args: string[]): string {
  const idx = args.indexOf('--rpc')
  const fromFlag = idx === -1 ? undefined : args[idx + 1]
  return fromFlag || process.env.RPC_URL || clusterApiUrl('devnet')
}

/** TREASURY_KEYPAIR may point to an existing (possibly pre-funded) keypair. */
function resolveTreasury(): Keypair {
  const envPath = process.env.TREASURY_KEYPAIR
  if (!envPath || !fs.existsSync(envPath)) return loadOrGenerate('treasury.json')

  const treasury = readKeypair(envPath)
  console.log(`[mint] using TREASURY_KEYPAIR: ${treasury.publicKey.toBase58()}`)
  return treasury
}

/** Secret keys are written owner-read/write only: they are money. */
function saveKeys(mint: Keypair, treasury: Keypair): void {
  fs.mkdirSync(KEYS_DIR, { recursive: true, mode: 0o700 })
  for (const [name, keypair] of [
    ['mint.json', mint],
    ['treasury.json', treasury],
  ] as const) {
    const file = path.join(KEYS_DIR, name)
    fs.writeFileSync(file, JSON.stringify(Array.from(keypair.secretKey)), { mode: 0o600 })
    // `mode` only applies to newly created files; tighten ones left by an earlier run.
    fs.chmodSync(file, 0o600)
  }
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
