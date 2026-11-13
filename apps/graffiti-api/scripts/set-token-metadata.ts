/**
 * Gives the wall's mint a name, a symbol and a logo, so wallets stop calling it UNKNOWN.
 *
 * Creates (or updates, re-runnably) the Metaplex Token Metadata account for MINT,
 * signed by the mint authority — the same treasury `create-mint.ts` used. The logo
 * itself is not on-chain: TOKEN_URI points at a JSON file whose `image` field is the
 * PNG, both served from the frontend (`apps/cowswap-frontend/public/token/`).
 *
 * Usage: pnpm token:metadata -- --mint <pubkey> [--rpc <url>]
 *   TOKEN_NAME / TOKEN_SYMBOL / TOKEN_URI override the defaults below.
 *   Keys come from TREASURY_SECRET_KEY / TREASURY_KEYPAIR, else .keys/treasury.json.
 */
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  type TransactionInstruction,
} from '@solana/web3.js'

import path from 'node:path'

import { flag, resolveRpcUrl, resolveTreasuryFromEnv, TREASURY_KEY_FILE } from './cli.js'

import { PKG_ROOT } from '../src/config.js'
import { readSecretKeyFile } from '../src/keypair.js'
import {
  createMetadataInstruction,
  findMetadataPda,
  METADATA_ACCOUNT_SIZE,
  readUpdateAuthority,
  type TokenMetadataFields,
  updateMetadataInstruction,
  validateFields,
} from '../src/tokenMetadata.js'
import { errorMessage } from '../src/util.js'

/** Kept in step with TOKEN_SYMBOL in the frontend's `pages/graffiti/wall.constants.ts`. */
const DEFAULT_NAME = 'GRASS'
const DEFAULT_SYMBOL = 'GRASS'
const DEFAULT_URI = 'https://swap.cow.fi/token/grass.json'

const SIGNATURE_FEE_LAMPORTS = 5_000

async function buildCreate(
  connection: Connection,
  mint: PublicKey,
  treasury: Keypair,
  fields: TokenMetadataFields,
): Promise<TransactionInstruction> {
  const mintAccount = await getMint(connection, mint, undefined, TOKEN_PROGRAM_ID)
  if (!mintAccount.mintAuthority?.equals(treasury.publicKey)) {
    throw new Error(
      `${treasury.publicKey.toBase58()} is not the mint authority of ${mint.toBase58()} ` +
        `(that is ${mintAccount.mintAuthority?.toBase58() ?? 'none — the mint authority was revoked'}); ` +
        'creating metadata needs the mint authority to sign.',
    )
  }

  const rent = await connection.getMinimumBalanceForRentExemption(METADATA_ACCOUNT_SIZE)
  const required = rent + SIGNATURE_FEE_LAMPORTS
  const balance = await connection.getBalance(treasury.publicKey)
  if (balance < required) {
    throw new Error(
      `treasury holds ${sol(balance)} SOL; creating the metadata account costs ${sol(required)} SOL. Fund it and re-run.`,
    )
  }

  console.log(`[metadata] Creating metadata account (rent ${sol(rent)} SOL) ...`)
  return createMetadataInstruction({ ...fields, mint, authority: treasury.publicKey })
}

function buildUpdate(
  mint: PublicKey,
  authority: Keypair,
  account: Buffer,
  fields: TokenMetadataFields,
): TransactionInstruction {
  const updateAuthority = readUpdateAuthority(account)
  if (!updateAuthority.equals(authority.publicKey)) {
    throw new Error(
      `${mint.toBase58()} already has metadata whose update authority is ${updateAuthority.toBase58()}, ` +
        'not this treasury; sign with that key instead.',
    )
  }

  console.log('[metadata] Metadata account exists; updating it in place.')
  return updateMetadataInstruction({ ...fields, mint, updateAuthority: authority.publicKey })
}

function explorerUrl(mint: PublicKey, rpcUrl: string): string {
  const cluster = rpcUrl.includes('devnet') ? '?cluster=devnet' : rpcUrl.includes('testnet') ? '?cluster=testnet' : ''
  return `https://explorer.solana.com/address/${mint.toBase58()}${cluster}`
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const rpcUrl = resolveRpcUrl(args)
  const mint = resolveMint(args)
  const fields: TokenMetadataFields = {
    name: process.env.TOKEN_NAME ?? DEFAULT_NAME,
    symbol: process.env.TOKEN_SYMBOL ?? DEFAULT_SYMBOL,
    uri: process.env.TOKEN_URI ?? DEFAULT_URI,
  }

  const invalid = validateFields(fields)
  if (invalid) throw new Error(invalid)

  const treasury = resolveTreasury()
  const connection = new Connection(rpcUrl, 'confirmed')

  console.log(`[metadata] RPC:       ${rpcUrl}`)
  console.log(`[metadata] mint:      ${mint.toBase58()}`)
  console.log(`[metadata] authority: ${treasury.publicKey.toBase58()}`)
  console.log(`[metadata] name:      ${fields.name} (${fields.symbol})`)
  console.log(`[metadata] uri:       ${fields.uri}`)

  await warnIfUriUnreachable(fields.uri)

  const existing = await connection.getAccountInfo(findMetadataPda(mint))
  const instruction = existing
    ? buildUpdate(mint, treasury, existing.data, fields)
    : await buildCreate(connection, mint, treasury, fields)

  const signature = await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [treasury], {
    commitment: 'confirmed',
  })

  console.log('')
  console.log(`[metadata] ${existing ? 'updated' : 'created'} — ${signature}`)
  console.log(`[metadata] ${explorerUrl(mint, rpcUrl)}`)
  console.log('[metadata] Wallets cache token metadata; re-add the token or wait a few minutes to see it.')
}

function resolveMint(args: string[]): PublicKey {
  const raw = flag(args, 'mint') || process.env.MINT
  if (!raw) throw new Error('no mint: pass --mint <pubkey> or set MINT')

  try {
    return new PublicKey(raw)
  } catch {
    throw new Error(`MINT=${raw} is not a valid public key`)
  }
}

function resolveTreasury(): Keypair {
  const configured = resolveTreasuryFromEnv()
  if (configured) {
    console.log(`[metadata] using ${configured.envHint.split('=')[0]}`)
    return configured.keypair
  }

  const keypair = readSecretKeyFile(TREASURY_KEY_FILE)
  if (!keypair) {
    throw new Error(
      'no treasury key: set TREASURY_SECRET_KEY or TREASURY_KEYPAIR, or put one at ' +
        path.relative(PKG_ROOT, TREASURY_KEY_FILE),
    )
  }
  return keypair
}

function sol(lamports: number): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(6)
}

/** A URI wallets cannot fetch is the usual reason a logo never shows up. */
async function warnIfUriUnreachable(uri: string): Promise<void> {
  try {
    const response = await fetch(uri, { redirect: 'follow' })
    if (!response.ok) {
      console.warn(`[metadata] WARNING: ${uri} answered ${response.status}; wallets will show no logo.`)
      return
    }

    const json: unknown = await response.json()
    const image = typeof json === 'object' && json !== null ? (json as Record<string, unknown>).image : undefined
    if (typeof image !== 'string' || !image.startsWith('http')) {
      console.warn(`[metadata] WARNING: ${uri} has no absolute "image" URL; wallets will show no logo.`)
      return
    }

    console.log(`[metadata] image:     ${image}`)
  } catch (err: unknown) {
    console.warn(`[metadata] WARNING: could not fetch ${uri}: ${errorMessage(err)}`)
  }
}

main().catch((err: unknown) => {
  console.error(`[metadata] ${errorMessage(err)}`)
  process.exit(1)
})
