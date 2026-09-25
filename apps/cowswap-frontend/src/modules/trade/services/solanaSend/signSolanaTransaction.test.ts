/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

import { signSolanaTransaction } from './signSolanaTransaction'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const PROGRAM_ID = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const BLOCKHASH = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi'

const owner = Keypair.generate()
const sponsor = Keypair.generate()

function createProvider(): SolanaProvider {
  return {
    signTransaction: jest.fn(async (transaction: Transaction) => {
      transaction.partialSign(owner)

      return transaction
    }),
    sendTransaction: jest.fn(),
    signAndSendTransaction: jest.fn(),
  } as unknown as SolanaProvider
}

/** A sponsored transaction: the owner authorises it, the sponsor pays and signs elsewhere. */
function sponsoredTransaction(): Transaction {
  return new Transaction({ feePayer: sponsor.publicKey, blockhash: BLOCKHASH, lastValidBlockHeight: 1 }).add(
    new TransactionInstruction({
      keys: [{ pubkey: owner.publicKey, isSigner: true, isWritable: true }],
      programId: PROGRAM_ID,
      data: Buffer.from([]),
    }),
  )
}

describe('signSolanaTransaction', () => {
  it('returns bytes carrying the owner signature the wallet added', async () => {
    const encoded = await signSolanaTransaction(createProvider(), sponsoredTransaction())

    const decoded = Transaction.from(Buffer.from(encoded, 'base64'))
    const ownerSignature = decoded.signatures.find(({ publicKey }) => publicKey.equals(owner.publicKey))

    expect(ownerSignature?.signature).not.toBeNull()
    expect(decoded.verifySignatures(false)).toBe(true)
  })

  // The whole point of the sponsored flow: the fee payer's slot travels empty and the back end fills it.
  it('serializes with the fee payer slot still empty', async () => {
    const encoded = await signSolanaTransaction(createProvider(), sponsoredTransaction())

    const decoded = Transaction.from(Buffer.from(encoded, 'base64'))
    const sponsorSignature = decoded.signatures.find(({ publicKey }) => publicKey.equals(sponsor.publicKey))

    expect(sponsorSignature?.signature).toBeNull()
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
