/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { Keypair, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js'

import { signSolanaTransaction } from './signSolanaTransaction'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const PROGRAM_ID = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const BLOCKHASH = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi'

const owner = Keypair.generate()
const sponsor = Keypair.generate()

function createProvider(): SolanaProvider {
  return {
    signTransaction: jest.fn(async (transaction: VersionedTransaction) => {
      transaction.sign([owner])

      return transaction
    }),
    sendTransaction: jest.fn(),
    signAndSendTransaction: jest.fn(),
  } as unknown as SolanaProvider
}

function isEmpty(signature: Uint8Array | undefined): boolean {
  return !signature || signature.every((byte) => byte === 0)
}

// Ed25519 signing is deterministic, so re-signing the same message with the same key reproduces the
// only signature that verifies over it — a stand-in for the legacy `verifySignatures()`.
function ownerSignatureOver(transaction: VersionedTransaction): Uint8Array | undefined {
  const reference = new VersionedTransaction(transaction.message)
  reference.sign([owner])

  return signatureOf(reference, owner.publicKey)
}

function signatureOf(transaction: VersionedTransaction, signer: PublicKey): Uint8Array | undefined {
  const index = transaction.message.staticAccountKeys.findIndex((key) => key.equals(signer))

  return transaction.signatures[index]
}

/** A sponsored transaction: the owner authorises it, the sponsor pays and signs elsewhere. */
function sponsoredTransaction(): VersionedTransaction {
  const message = new TransactionMessage({
    payerKey: sponsor.publicKey,
    recentBlockhash: BLOCKHASH,
    instructions: [
      new TransactionInstruction({
        keys: [{ pubkey: owner.publicKey, isSigner: true, isWritable: true }],
        programId: PROGRAM_ID,
        data: Buffer.from([]),
      }),
    ],
  }).compileToV0Message()

  return new VersionedTransaction(message)
}

describe('signSolanaTransaction', () => {
  it('returns bytes carrying the owner signature the wallet added', async () => {
    const encoded = await signSolanaTransaction(createProvider(), sponsoredTransaction())

    const decoded = VersionedTransaction.deserialize(Buffer.from(encoded, 'base64'))
    const ownerSignature = signatureOf(decoded, owner.publicKey)

    expect(isEmpty(ownerSignature)).toBe(false)
    expect(ownerSignature).toEqual(ownerSignatureOver(decoded))
  })

  // The whole point of the sponsored flow: the fee payer's slot travels empty and the back end fills it.
  it('serializes with the fee payer slot still empty', async () => {
    const encoded = await signSolanaTransaction(createProvider(), sponsoredTransaction())

    const decoded = VersionedTransaction.deserialize(Buffer.from(encoded, 'base64'))

    expect(isEmpty(signatureOf(decoded, sponsor.publicKey))).toBe(true)
  })

  // The transaction is the order book's to submit; broadcasting it here would create the order
  // on-chain at the owner's expense, defeating the sponsorship.
  it('signs without reaching either sending path', async () => {
    const provider = createProvider()

    await signSolanaTransaction(provider, sponsoredTransaction())

    expect(provider.signTransaction).toHaveBeenCalledTimes(1)
    expect(provider.sendTransaction).not.toHaveBeenCalled()
    expect(provider.signAndSendTransaction).not.toHaveBeenCalled()
  })
})
