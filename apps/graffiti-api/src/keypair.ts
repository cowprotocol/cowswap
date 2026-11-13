import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

import fs from 'node:fs'

/** Accepts a JSON byte array (`[12,34,...]`) or base58; null when it is neither. */
export function parseSecretKey(raw: string): Keypair | null {
  const text = raw.trim()
  try {
    if (text.startsWith('[')) {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(text) as number[]))
    }
    return Keypair.fromSecretKey(bs58.decode(text))
  } catch {
    return null
  }
}

/** Null when the file is missing or malformed. */
export function readSecretKeyFile(file: string): Keypair | null {
  try {
    return parseSecretKey(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}
