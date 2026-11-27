import { Keypair, Transaction, VersionedTransaction } from '@solana/web3.js'

export interface CreateSolanaWalletEngineOpts {
  /** 64-byte ed25519 secret key, base58 or JSON array — the shape `solana-keygen` writes. */
  secretKey: string
}

export interface SolanaSignCallRecord {
  transactionBase64: string
  signedBase64: string
}

export interface SolanaWalletEngine {
  readonly address: string
  /** Raw 32-byte public key, base64 — the page needs bytes for `WalletAccount.publicKey`. */
  readonly publicKeyBase64: string
  signTransactions(transactionsBase64: string[]): string[]
  signCalls(): SolanaSignCallRecord[]
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/**
 * Node-side half of the Solana mock wallet: holds the keypair and signs.
 *
 * Mirrors `createWalletEngine` — the key never reaches the page, so signing stays a pure function
 * this file's unit tests can exercise without a browser.
 */
export function createSolanaWalletEngine(opts: CreateSolanaWalletEngineOpts): SolanaWalletEngine {
  const keypair = Keypair.fromSecretKey(parseSecretKey(opts.secretKey))
  const calls: SolanaSignCallRecord[] = []

  return {
    address: keypair.publicKey.toBase58(),
    publicKeyBase64: Buffer.from(keypair.publicKey.toBytes()).toString('base64'),
    signTransactions(transactionsBase64) {
      return transactionsBase64.map((transactionBase64) => {
        const signedBase64 = signTransaction(keypair, Buffer.from(transactionBase64, 'base64'))

        calls.push({ transactionBase64, signedBase64 })

        return signedBase64
      })
    },
    signCalls() {
      return [...calls]
    },
  }
}

/**
 * Inlined rather than taken from `bs58`, which this app does not depend on — a secret key is the
 * only thing it ever decodes, and `@solana/web3.js` exposes no decoder of its own.
 */
function decodeBase58(value: string): Uint8Array {
  const bytes: number[] = [0]

  for (const character of value) {
    const digit = BASE58_ALPHABET.indexOf(character)

    if (digit === -1) throw new Error(`Solana mock wallet: "${character}" is not a base58 character`)

    let carry = digit
    for (let i = 0; i < bytes.length; i++) {
      carry += (bytes[i] ?? 0) * 58
      bytes[i] = carry & 0xff
      carry >>= 8
    }
    while (carry > 0) {
      bytes.push(carry & 0xff)
      carry >>= 8
    }
  }

  // Each leading '1' is a leading zero byte that the arithmetic above cannot represent.
  for (const character of value) {
    if (character !== '1') break
    bytes.push(0)
  }

  return Uint8Array.from(bytes.reverse())
}

function deserializeVersioned(bytes: Buffer): VersionedTransaction | null {
  try {
    return VersionedTransaction.deserialize(bytes)
  } catch {
    return null
  }
}

function parseSecretKey(secretKey: string): Uint8Array {
  const trimmed = secretKey.trim()

  if (trimmed.startsWith('[')) {
    const parsed: unknown = JSON.parse(trimmed)

    if (!Array.isArray(parsed) || parsed.some((byte) => typeof byte !== 'number')) {
      throw new Error('Solana mock wallet: JSON secret key must be an array of byte numbers')
    }

    return Uint8Array.from(parsed as number[])
  }

  return decodeBase58(trimmed)
}

function signTransaction(keypair: Keypair, bytes: Buffer): string {
  const versioned = deserializeVersioned(bytes)

  if (versioned) {
    versioned.sign([keypair])

    return Buffer.from(versioned.serialize()).toString('base64')
  }

  const legacy = Transaction.from(bytes)
  legacy.partialSign(keypair)

  // CoW leaves the sponsor's signature slot empty until the back end fills it, so a transaction the
  // user has correctly signed still fails `verifySignatures`.
  return legacy.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64')
}
