/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

import { signSolanaFlow, SignSolanaFlowContext } from './signSolanaFlow'
import { SolanaFlowStep } from './types'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const OWNER = Keypair.generate()
const SPONSOR = new PublicKey('So11111111111111111111111111111111111111112')
const BLOCKHASH = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi'
const LAST_VALID_BLOCK_HEIGHT = 1_234

function createContext(currentBlockHeight = LAST_VALID_BLOCK_HEIGHT - 1): SignSolanaFlowContext & {
  sendTransaction: jest.Mock
} {
  const connection = {
    getLatestBlockhash: jest
      .fn()
      .mockResolvedValue({ blockhash: BLOCKHASH, lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT }),
    getBlockHeight: jest.fn().mockResolvedValue(currentBlockHeight),
  } as unknown as Connection

  const sendTransaction = jest.fn()
  const provider = {
    signTransaction: jest.fn(async (transaction: Transaction) => {
      transaction.partialSign(OWNER)

      return transaction
    }),
    sendTransaction,
  } as unknown as SolanaProvider

  return { connection, provider, feePayer: SPONSOR, sendTransaction }
}

function step(summary: string): SolanaFlowStep {
  return {
    instructions: [
      new TransactionInstruction({
        keys: [{ pubkey: OWNER.publicKey, isSigner: true, isWritable: true }],
        programId: SPONSOR,
        data: Buffer.from([]),
      }),
    ],
    summary,
  }
}

describe('signSolanaFlow', () => {
  it('throws when given no steps', async () => {
    await expect(signSolanaFlow(createContext(), [])).rejects.toThrow('signSolanaFlow: no steps to sign')
  })

  it('returns a transaction the owner signed and the sponsor has not', async () => {
    const { transaction } = await signSolanaFlow(createContext(), [step('Swap SOL for USDC')])

    const decoded = Transaction.from(Buffer.from(transaction, 'base64'))
    const signatureOf = (key: PublicKey): Uint8Array | null =>
      decoded.signatures.find(({ publicKey }) => publicKey.equals(key))?.signature ?? null

    expect(signatureOf(OWNER.publicKey)).not.toBeNull()
    expect(signatureOf(SPONSOR)).toBeNull()
  })

  // Broadcasting here would create the order at the owner's expense and defeat the sponsorship.
  it('never submits the transaction', async () => {
    const context = createContext()

    await signSolanaFlow(context, [step('Swap SOL for USDC')])

    expect(context.sendTransaction).not.toHaveBeenCalled()
  })

  it('reports the blockhash deadline the order lives under', async () => {
    const { lastValidBlockHeight } = await signSolanaFlow(createContext(), [step('Swap SOL for USDC')])

    expect(lastValidBlockHeight).toBe(LAST_VALID_BLOCK_HEIGHT)
  })

  // The countdown has to start when the blockhash is taken, so the deadline must be out before the
  // wallet is asked — not when the signature comes back.
  it('announces the deadline before asking the wallet to sign', async () => {
    const context = createContext()
    const order: string[] = []
    context.onDeadline = (deadline) => order.push(`deadline:${deadline}`)
    const signTransaction = context.provider.signTransaction as jest.Mock
    signTransaction.mockImplementation(async (transaction: Transaction) => {
      order.push('sign')
      transaction.partialSign(OWNER)

      return transaction
    })

    await signSolanaFlow(context, [step('Swap SOL for USDC')])

    expect(order).toEqual([`deadline:${LAST_VALID_BLOCK_HEIGHT}`, 'sign'])
  })

  // A dead blockhash wastes the signature: the order book takes it, no solver can submit it, and the
  // order rests until validTo while the user believes it is live — so the hand-over must fail loudly.
  it('refuses to hand over a transaction whose blockhash died while the user was approving', async () => {
    await expect(
      signSolanaFlow(createContext(LAST_VALID_BLOCK_HEIGHT + 1), [step('Swap SOL for USDC')]),
    ).rejects.toThrow('The signing window closed before the transaction was signed')
  })

  // The user has already signed by the time the height is read; an RPC blip there must not discard
  // the signature — the order book re-checks blockhash liveness itself.
  it('still hands over the signed transaction when the height read fails', async () => {
    const context = createContext()
    ;(context.connection.getBlockHeight as jest.Mock).mockRejectedValue(new Error('rpc down'))

    const { transaction, signedAtMs } = await signSolanaFlow(context, [step('Swap SOL for USDC')])

    expect(transaction).toBeTruthy()
    expect(signedAtMs).toBeLessThanOrEqual(Date.now())
  })
})
