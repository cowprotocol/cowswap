/**
 * @jest-environment node
 *
 * web3.js address/PDA derivation is unreliable under jsdom; the Solana balance tests in
 * libs/balances-and-allowances use the node environment for the same reason.
 */
import { OrderKind } from '@cowprotocol/cow-sdk'

import { solanaOrderFlow } from './index'

import type { SolanaOrderFlowContext } from './types'
import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'
import type { Connection, Transaction } from '@solana/web3.js'

const OWNER = '54o2XBzBTkP7tmQSLu3Um9oDvLdNVrbMyQxqiYVKALLN'
// Any well-formed base58 32-byte value works as a fake blockhash
const BLOCKHASH = 'EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N'

function buildContext(): SolanaOrderFlowContext & {
  connection: { getLatestBlockhash: jest.Mock; confirmTransaction: jest.Mock; getSignatureStatus: jest.Mock }
  walletProvider: { sendTransaction: jest.Mock }
} {
  const connection = {
    getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: BLOCKHASH, lastValidBlockHeight: 100 }),
    confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
    getSignatureStatus: jest.fn().mockResolvedValue({ value: { err: null, confirmationStatus: 'confirmed' } }),
  }
  const walletProvider = {
    sendTransaction: jest.fn().mockResolvedValue('mockSignature'),
  }

  return {
    account: OWNER,
    sellToken: { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', isToken2022: false },
    buyToken: { address: 'So11111111111111111111111111111111111111112', isToken2022: false },
    sellAmount: 1_000_000n,
    buyAmount: 5_000_000n,
    kind: OrderKind.SELL,
    partiallyFillable: true,
    customDeadlineTimestamp: null,
    deadlineMilliseconds: 3_600_000,
    connection: connection as unknown as Connection,
    walletProvider: walletProvider as unknown as SolanaProvider,
  } as never
}

describe('solanaOrderFlow', () => {
  it('sends a 3-instruction transaction and returns signature, UID and PDA', async () => {
    const ctx = buildContext()

    const result = await solanaOrderFlow(ctx)

    expect(result.signature).toBe('mockSignature')
    expect(result.orderUid).toMatch(/^[0-9a-f]{64}$/)
    expect(result.orderPda).toBeTruthy()

    expect(ctx.walletProvider.sendTransaction).toHaveBeenCalledTimes(1)
    const [tx] = ctx.walletProvider.sendTransaction.mock.calls[0] as [Transaction]
    expect(tx.instructions).toHaveLength(3)
    expect(tx.feePayer?.toBase58()).toBe(OWNER)
    expect(tx.recentBlockhash).toBe(BLOCKHASH)

    expect(ctx.connection.confirmTransaction).toHaveBeenCalledWith(
      { signature: 'mockSignature', blockhash: BLOCKHASH, lastValidBlockHeight: 100 },
      'confirmed',
    )
  })

  it('uses the custom deadline timestamp as validTo when set', async () => {
    const ctx = buildContext()
    ctx.customDeadlineTimestamp = 1893456000

    await solanaOrderFlow(ctx)

    const [tx] = ctx.walletProvider.sendTransaction.mock.calls[0] as [Transaction]
    const createOrderData = tx.instructions[2].data
    // valid_to is a u32 LE at intent offset 112, i.e. data offset 113 (after the discriminator)
    expect(createOrderData.readUInt32LE(113)).toBe(1893456000)
  })

  it('throws when on-chain confirmation reports an error', async () => {
    const ctx = buildContext()
    ctx.connection.confirmTransaction.mockResolvedValue({ value: { err: { InstructionError: [2, 'Custom'] } } })

    await expect(solanaOrderFlow(ctx)).rejects.toThrow('Solana transaction failed')
  })

  it('treats a block-height-exceeded timeout as success when the tx actually landed', async () => {
    const ctx = buildContext()
    // confirmTransaction throws the expiry error even though the tx landed at the edge of the window
    ctx.connection.confirmTransaction.mockRejectedValue(new Error('block height exceeded'))
    ctx.connection.getSignatureStatus.mockResolvedValue({ value: { err: null, confirmationStatus: 'finalized' } })

    const result = await solanaOrderFlow(ctx)

    expect(result.signature).toBe('mockSignature')
    expect(ctx.connection.getSignatureStatus).toHaveBeenCalledWith('mockSignature', { searchTransactionHistory: true })
  })

  it('rethrows the timeout when the tx never landed', async () => {
    const ctx = buildContext()
    ctx.connection.confirmTransaction.mockRejectedValue(new Error('block height exceeded'))
    ctx.connection.getSignatureStatus.mockResolvedValue({ value: null })

    await expect(solanaOrderFlow(ctx)).rejects.toThrow('block height exceeded')
  })
})
