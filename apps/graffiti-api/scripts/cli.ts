/** Shared argument/key plumbing for the ops scripts (create-mint, set-token-metadata). */
import { clusterApiUrl, Keypair } from '@solana/web3.js'

import path from 'node:path'

import { PKG_ROOT } from '../src/config.js'
import { parseSecretKey, readSecretKeyFile } from '../src/keypair.js'

export const KEYS_DIR = path.resolve(PKG_ROOT, '.keys')
export const TREASURY_KEY_FILE = path.join(KEYS_DIR, 'treasury.json')

export interface ConfiguredKey {
  keypair: Keypair
  /** How to hand this same key to another script or the server. */
  envHint: string
}

/** `--name value` from a script's argv tail; undefined when absent. */
export function flag(args: string[], name: string): string | undefined {
  const idx = args.indexOf(`--${name}`)
  return idx === -1 ? undefined : args[idx + 1]
}

export function resolveRpcUrl(args: string[]): string {
  return flag(args, 'rpc') || process.env.RPC_URL || clusterApiUrl('devnet')
}

/**
 * TREASURY_SECRET_KEY beats the TREASURY_KEYPAIR file; null when neither is set, so
 * callers decide whether to fall back to `.keys/` or to fail. An unreadable key is
 * fatal, never a silent fallback to a fresh unfunded treasury.
 */
export function resolveTreasuryFromEnv(): ConfiguredKey | null {
  const inline = process.env.TREASURY_SECRET_KEY
  if (inline) {
    const keypair = parseSecretKey(inline)
    if (!keypair) throw new Error('TREASURY_SECRET_KEY is set but is neither a JSON byte array nor base58')

    return { keypair, envHint: 'TREASURY_SECRET_KEY=<as passed to this script>' }
  }

  const envPath = process.env.TREASURY_KEYPAIR
  if (!envPath) return null

  const keypair = readSecretKeyFile(envPath)
  if (!keypair) throw new Error(`TREASURY_KEYPAIR=${envPath} could not be read as a keypair`)

  return { keypair, envHint: `TREASURY_KEYPAIR=${envPath}` }
}
