/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { Connection, PublicKey } from '@solana/web3.js'

import { sendSolanaFlow } from './sendSolanaFlow'
import { solanaNativeSwapCallback, SolanaNativeSwapContext } from './solanaNativeSwapCallback'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

// Avoids `@cowprotocol/tokens` (pulled in via balances-and-allowances), which reads `window.location` at import time.
jest.mock('@cowprotocol/balances-and-allowances', () => ({
  findSolanaSettlementStatePda: jest.fn(
    () => new (jest.requireActual('@solana/web3.js').PublicKey)('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
  ),
}))

jest.mock('./sendSolanaFlow', () => ({
  sendSolanaFlow: jest.fn(async () => ({ hash: 'HASH' })),
}))

const mockSendSolanaFlow = sendSolanaFlow as jest.Mock

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')

function createContext(overrides: Partial<SolanaNativeSwapContext> = {}): SolanaNativeSwapContext {
  return {
    account: OWNER.toBase58(),
    connection: {} as Connection,
    provider: {} as SolanaProvider,
    addTransaction: jest.fn(),
    sellAmount: 10_000n,
    currentDelegation: 0n,
    ...overrides,
  }
}

function summariesPassedToSend(): string[] {
  const [, steps] = mockSendSolanaFlow.mock.calls[0] as [unknown, { summary: string }[]]
  return steps.map((step) => step.summary)
}

beforeEach(() => jest.clearAllMocks())

describe('solanaNativeSwapCallback', () => {
  it('includes both the wrap and delegate steps when the existing delegation falls short', async () => {
    await solanaNativeSwapCallback(createContext({ sellAmount: 10_000n, currentDelegation: 0n }))

    const summaries = summariesPassedToSend()
    expect(summaries).toHaveLength(2)
    expect(summaries[0]).toContain('Wrap')
    expect(summaries[1]).toContain('Approve')
  })

  it('excludes the delegate step when the existing delegation already covers the sell amount', async () => {
    await solanaNativeSwapCallback(createContext({ sellAmount: 10_000n, currentDelegation: 10_000n }))

    const summaries = summariesPassedToSend()
    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toContain('Wrap')
  })
})
