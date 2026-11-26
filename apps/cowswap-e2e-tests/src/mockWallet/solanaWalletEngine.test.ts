import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { createSolanaWalletEngine } from './solanaWalletEngine'

// Fixed 32-byte seed — public knowledge, never funded.
const TEST_SEED = Uint8Array.from(Array.from({ length: 32 }, (_, index) => index + 1))
const TEST_KEYPAIR = Keypair.fromSeed(TEST_SEED)
const TEST_SECRET_KEY_JSON = JSON.stringify(Array.from(TEST_KEYPAIR.secretKey))

// A real blockhash shape; the engine never checks it against a cluster.
const BLOCKHASH = '11111111111111111111111111111111'

const RECIPIENT = new PublicKey('11111111111111111111111111111112')

function buildLegacyTransaction(feePayer: PublicKey): Transaction {
  const transaction = new Transaction({ feePayer, blockhash: BLOCKHASH, lastValidBlockHeight: 1 })

  transaction.add(SystemProgram.transfer({ fromPubkey: feePayer, toPubkey: RECIPIENT, lamports: 1 }))

  return transaction
}

function serializeUnsigned(transaction: Transaction): string {
  return transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64')
}

test('derives the address from the secret key', () => {
  const engine = createSolanaWalletEngine({ secretKey: TEST_SECRET_KEY_JSON })

  assert.equal(engine.address, TEST_KEYPAIR.publicKey.toBase58())
})

test('exposes the public key as the raw bytes the page needs', () => {
  const engine = createSolanaWalletEngine({ secretKey: TEST_SECRET_KEY_JSON })

  assert.deepEqual(
    Array.from(Buffer.from(engine.publicKeyBase64, 'base64')),
    Array.from(TEST_KEYPAIR.publicKey.toBytes()),
  )
})

test('signs a legacy transaction with a signature the chain would accept', () => {
  const engine = createSolanaWalletEngine({ secretKey: TEST_SECRET_KEY_JSON })

  const [signedBase64] = engine.signTransactions([serializeUnsigned(buildLegacyTransaction(TEST_KEYPAIR.publicKey))])

  const signed = Transaction.from(Buffer.from(String(signedBase64), 'base64'))

  assert.equal(signed.signatures.length, 1)
  assert.ok(signed.verifySignatures())
})

test('keeps a co-signer slot empty instead of failing the signature check', () => {
  const engine = createSolanaWalletEngine({ secretKey: TEST_SECRET_KEY_JSON })
  const sponsor = Keypair.generate()

  const transaction = buildLegacyTransaction(sponsor.publicKey)
  transaction.add(SystemProgram.transfer({ fromPubkey: TEST_KEYPAIR.publicKey, toPubkey: RECIPIENT, lamports: 1 }))

  const [signedBase64] = engine.signTransactions([serializeUnsigned(transaction)])
  const signed = Transaction.from(Buffer.from(String(signedBase64), 'base64'))

  const ourSignature = signed.signatures.find(({ publicKey }) => publicKey.equals(TEST_KEYPAIR.publicKey))
  const sponsorSignature = signed.signatures.find(({ publicKey }) => publicKey.equals(sponsor.publicKey))

  assert.ok(ourSignature?.signature, 'our slot is signed')
  assert.equal(sponsorSignature?.signature, null, 'the sponsor slot stays empty')
})

test('signs a versioned transaction', () => {
  const engine = createSolanaWalletEngine({ secretKey: TEST_SECRET_KEY_JSON })

  const message = new TransactionMessage({
    payerKey: TEST_KEYPAIR.publicKey,
    recentBlockhash: BLOCKHASH,
    instructions: [SystemProgram.transfer({ fromPubkey: TEST_KEYPAIR.publicKey, toPubkey: RECIPIENT, lamports: 1 })],
  }).compileToV0Message()
  const unsigned = Buffer.from(new VersionedTransaction(message).serialize()).toString('base64')

  const [signedBase64] = engine.signTransactions([unsigned])
  const signed = VersionedTransaction.deserialize(Buffer.from(String(signedBase64), 'base64'))

  assert.notDeepEqual(Array.from(signed.signatures[0] ?? []), new Array(64).fill(0))
})

test('signs a batch in order and records every call', () => {
  const engine = createSolanaWalletEngine({ secretKey: TEST_SECRET_KEY_JSON })

  const first = serializeUnsigned(buildLegacyTransaction(TEST_KEYPAIR.publicKey))
  const second = serializeUnsigned(
    buildLegacyTransaction(TEST_KEYPAIR.publicKey).add(
      SystemProgram.transfer({ fromPubkey: TEST_KEYPAIR.publicKey, toPubkey: RECIPIENT, lamports: 2 }),
    ),
  )

  const signed = engine.signTransactions([first, second])

  assert.equal(signed.length, 2)
  assert.deepEqual(
    engine.signCalls().map(({ transactionBase64 }) => transactionBase64),
    [first, second],
  )
})

test('accepts a base58 secret key, as solana-keygen prints it', () => {
  const base58SecretKey = encodeBase58(TEST_KEYPAIR.secretKey)

  const engine = createSolanaWalletEngine({ secretKey: base58SecretKey })

  assert.equal(engine.address, TEST_KEYPAIR.publicKey.toBase58())
})

test('rejects a secret key that is not base58', () => {
  assert.throws(() => createSolanaWalletEngine({ secretKey: 'not valid 0OIl' }), /not a base58 character/)
})

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function encodeBase58(bytes: Uint8Array): string {
  const digits: number[] = [0]

  for (const byte of bytes) {
    let carry = byte
    for (let i = 0; i < digits.length; i++) {
      carry += (digits[i] ?? 0) << 8
      digits[i] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }

  let leadingZeros = ''
  for (const byte of bytes) {
    if (byte !== 0) break
    leadingZeros += '1'
  }

  return (
    leadingZeros +
    digits
      .reverse()
      .map((digit) => BASE58_ALPHABET[digit])
      .join('')
  )
}
