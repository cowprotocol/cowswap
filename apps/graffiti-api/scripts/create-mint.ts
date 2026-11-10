/**
 * Token setup for the Graffiti Wall (spec §Token ops): creates the mint (decimals 0),
 * the treasury ATA, and INITIAL_SUPPLY minted to the treasury. Prints MINT / TREASURY.
 *
 * Keys come from TREASURY_SECRET_KEY / MINT_SECRET_KEY (JSON byte array or base58) or
 * TREASURY_KEYPAIR (file); a supplied key is never copied into .keys/. Generated ones
 * are written there, gitignored, mode 0600.
 *
 * Usage: pnpm mint:create  [RPC_URL=… | -- --rpc …]
 */
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, type PublicKey } from '@solana/web3.js'

import fs from 'node:fs'
import path from 'node:path'

import { INITIAL_SUPPLY, PKG_ROOT } from '../src/config.js'
import { parseSecretKey, readSecretKeyFile } from '../src/keypair.js'
import { errorMessage } from '../src/util.js'

interface ResolvedKey {
  keypair: Keypair
  /** Only keys this script generated are written to .keys/; supplied ones stay at their source. */
  persist: boolean
}

interface TreasuryKey extends ResolvedKey {
  /** How to hand this same key to the server. */
  envHint: string
}

const KEYS_DIR = path.resolve(PKG_ROOT, '.keys')
const MIN_TREASURY_LAMPORTS = LAMPORTS_PER_SOL
const AIRDROP_LAMPORTS = 2 * LAMPORTS_PER_SOL
const MAINNET_GENESIS_HASH = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d'

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

  if (await isMainnet(connection)) {
    console.error(`\n[mint] treasury ${treasury.publicKey.toBase58()} holds under 1 SOL.`)
    console.error('[mint] Mainnet has no faucet: send it SOL, then re-run. Budget roughly')
    console.error('       0.00204 SOL per claim redemption, i.e. ~2.1 SOL per 1000 codes.')
    return false
  }

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

async function isMainnet(connection: Connection): Promise<boolean> {
  try {
    return (await connection.getGenesisHash()) === MAINNET_GENESIS_HASH
  } catch {
    return false
  }
}

/** Reuse existing keypairs so the script can be re-run after a manual funding. */
function loadOrGenerate(name: string): ResolvedKey {
  const file = path.join(KEYS_DIR, name)
  if (!fs.existsSync(file)) return { keypair: Keypair.generate(), persist: true }

  const keypair = readSecretKeyFile(file)
  if (!keypair) throw new Error(`${file} exists but is not a valid keypair; move it aside or delete it`)

  console.log(`[mint] reusing existing ${name}: ${keypair.publicKey.toBase58()}`)
  return { keypair, persist: true }
}

async function main(): Promise<void> {
  const rpcUrl = resolveRpcUrl(process.argv.slice(2))
  console.log(`[mint] RPC: ${rpcUrl}`)

  const connection = new Connection(rpcUrl, 'confirmed')
  const treasury = resolveTreasury()
  const mint = resolveMint()

  // Persist before any network call so a failed funding step can be resumed.
  saveKeys(mint, treasury)

  if (!(await ensureFunded(connection, treasury.keypair))) process.exit(1)

  const mintPubkey = await createToken(connection, treasury.keypair, mint.keypair)
  printSummary(mintPubkey, treasury)
}

function printSummary(mint: PublicKey, treasury: TreasuryKey): void {
  console.log('')
  console.log('=========================================')
  console.log(`MINT     = ${mint.toBase58()}`)
  console.log(`TREASURY = ${treasury.keypair.publicKey.toBase58()}`)
  console.log('=========================================')
  console.log(
    treasury.persist
      ? `Treasury keypair saved to ${path.join(KEYS_DIR, 'treasury.json')} (gitignored, mode 0600) — back it up, it is money.`
      : 'The supplied treasury key was not written to disk.',
  )
  console.log('Run the API with:')
  console.log(`  MINT=${mint.toBase58()} ${treasury.envHint} \\`)
  console.log('  ADMIN_TOKEN=<secret> pnpm --filter @cowprotocol/graffiti-api run dev')
}

/** MINT_SECRET_KEY carries a pre-generated (e.g. vanity) mint address. */
function resolveMint(): ResolvedKey {
  const inline = process.env.MINT_SECRET_KEY
  if (!inline) return loadOrGenerate('mint.json')

  const keypair = parseSecretKey(inline)
  if (!keypair) throw new Error('MINT_SECRET_KEY is set but is neither a JSON byte array nor base58')

  console.log(`[mint] using MINT_SECRET_KEY: ${keypair.publicKey.toBase58()}`)
  return { keypair, persist: false }
}

function resolveRpcUrl(args: string[]): string {
  const idx = args.indexOf('--rpc')
  const fromFlag = idx === -1 ? undefined : args[idx + 1]
  return fromFlag || process.env.RPC_URL || clusterApiUrl('devnet')
}

/**
 * TREASURY_SECRET_KEY beats the TREASURY_KEYPAIR file, which beats .keys/treasury.json.
 * An unreadable key is fatal, never a silent fallback to a fresh unfunded treasury.
 */
function resolveTreasury(): TreasuryKey {
  const inline = process.env.TREASURY_SECRET_KEY
  if (inline) {
    const keypair = parseSecretKey(inline)
    if (!keypair) throw new Error('TREASURY_SECRET_KEY is set but is neither a JSON byte array nor base58')

    console.log(`[mint] using TREASURY_SECRET_KEY: ${keypair.publicKey.toBase58()}`)
    return { keypair, persist: false, envHint: 'TREASURY_SECRET_KEY=<as passed to this script>' }
  }

  const envPath = process.env.TREASURY_KEYPAIR
  if (envPath) {
    const keypair = readSecretKeyFile(envPath)
    if (!keypair) throw new Error(`TREASURY_KEYPAIR=${envPath} could not be read as a keypair`)

    console.log(`[mint] using TREASURY_KEYPAIR: ${keypair.publicKey.toBase58()}`)
    return { keypair, persist: false, envHint: `TREASURY_KEYPAIR=${envPath}` }
  }

  return { ...loadOrGenerate('treasury.json'), envHint: `TREASURY_KEYPAIR=${path.join(KEYS_DIR, 'treasury.json')}` }
}

/** Secret keys are written owner-read/write only: they are money. */
function saveKeys(mint: ResolvedKey, treasury: ResolvedKey): void {
  const toWrite = (
    [
      ['mint.json', mint],
      ['treasury.json', treasury],
    ] as const
  ).filter(([, key]) => key.persist)

  if (toWrite.length === 0) return

  fs.mkdirSync(KEYS_DIR, { recursive: true, mode: 0o700 })
  for (const [name, key] of toWrite) {
    const file = path.join(KEYS_DIR, name)
    fs.writeFileSync(file, JSON.stringify(Array.from(key.keypair.secretKey)), { mode: 0o600 })
    // `mode` only applies to newly created files; tighten ones left by an earlier run.
    fs.chmodSync(file, 0o600)
  }
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
