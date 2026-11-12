/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { buildComputeBudgetInstructions, resolveSolanaComputeBudget } from '@cowprotocol/sdk-trading-solana'

import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { signSolanaFlow, SignSolanaFlowContext } from './signSolanaFlow'
import { SolanaFlowStep } from './types'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  resolveSolanaComputeBudget: jest.fn(),
  buildComputeBudgetInstructions: jest.fn(),
}))

const COMPUTE_BUDGET = { unitLimit: 110_000, unitPriceMicroLamports: 10_000 }

const mockResolveSolanaComputeBudget = jest.mocked(resolveSolanaComputeBudget)
const mockBuildComputeBudgetInstructions = jest.mocked(buildComputeBudgetInstructions)

const OWNER = Keypair.generate()
const SPONSOR = new PublicKey('So11111111111111111111111111111111111111112')
const BLOCKHASH = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi'
const LAST_VALID_BLOCK_HEIGHT = 1_234

function createContext(): SignSolanaFlowContext & {
  sendTransaction: jest.Mock
} {
  const connection = {
    getLatestBlockhash: jest
      .fn()
      .mockResolvedValue({ blockhash: BLOCKHASH, lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT }),
    getBlockHeight: jest.fn().mockResolvedValue(LAST_VALID_BLOCK_HEIGHT - 1),
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
  beforeEach(() => {
    jest.clearAllMocks()
    mockResolveSolanaComputeBudget.mockResolvedValue(COMPUTE_BUDGET)
    mockBuildComputeBudgetInstructions.mockReturnValue([
      ComputeBudgetProgram.setComputeUnitLimit({ units: COMPUTE_BUDGET.unitLimit }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: COMPUTE_BUDGET.unitPriceMicroLamports }),
    ])
  })

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

  // The countdown has to start when the blockhash is taken, so the deadline must be out before the
  // wallet is asked — not when the signature comes back.
  it('announces the deadline before asking the wallet to sign', async () => {
    const context = createContext()
    const order: string[] = []
    context.onDeadline = () => order.push('deadline')
    const signTransaction = context.provider.signTransaction as jest.Mock
    signTransaction.mockImplementation(async (transaction: Transaction) => {
      order.push('sign')
      transaction.partialSign(OWNER)

      return transaction
    })

    await signSolanaFlow(context, [step('Swap SOL for USDC')])

    expect(order).toEqual(['deadline', 'sign'])
  })

  // A transaction carrying no compute budget gets one from the wallet, which spends the sponsor's
  // lamports and can exceed the order book's ceiling for them.
  it('carries the resolved compute budget ahead of the steps own instructions', async () => {
    const { transaction } = await signSolanaFlow(createContext(), [step('Swap SOL for USDC')])

    const decoded = Transaction.from(Buffer.from(transaction, 'base64'))

    expect(decoded.instructions).toHaveLength(3)
    expect(decoded.instructions.slice(0, 2).map(({ programId }) => programId.toBase58())).toEqual([
      ComputeBudgetProgram.programId.toBase58(),
      ComputeBudgetProgram.programId.toBase58(),
    ])
    expect(mockBuildComputeBudgetInstructions).toHaveBeenCalledWith(COMPUTE_BUDGET)
  })

  it('prices the bundle it is about to sign, naming the sponsor as the payer', async () => {
    const context = createContext()
    const steps = [step('Wrap SOL'), step('Swap SOL for USDC')]

    await signSolanaFlow(context, steps)

    expect(mockResolveSolanaComputeBudget).toHaveBeenCalledWith(context.connection, {
      instructions: steps.flatMap(({ instructions }) => instructions),
      feePayer: SPONSOR,
    })
  })

  // Resolving costs two round trips, and the blockhash is what the signing window is counted from.
  it('resolves the budget before taking the blockhash', async () => {
    const context = createContext()
    const order: string[] = []
    mockResolveSolanaComputeBudget.mockImplementation(async () => {
      order.push('budget')

      return COMPUTE_BUDGET
    })
    ;(context.connection.getLatestBlockhash as jest.Mock).mockImplementation(async () => {
      order.push('blockhash')

      return { blockhash: BLOCKHASH, lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT }
    })

    await signSolanaFlow(context, [step('Swap SOL for USDC')])

    expect(order).toEqual(['budget', 'blockhash'])
  })

  // A load-balanced RPC can answer two calls from nodes a minute apart, reading a seconds-old
  // blockhash as dead — a given signature must never be discarded over a height read-back.
  it('hands over the signed transaction without reading the block height back', async () => {
    const context = createContext()

    const { transaction, signedAtMs } = await signSolanaFlow(context, [step('Swap SOL for USDC')])

    expect(transaction).toBeTruthy()
    expect(signedAtMs).toBeLessThanOrEqual(Date.now())
    expect(context.connection.getBlockHeight).not.toHaveBeenCalled()
  })
})
