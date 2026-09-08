import { TokenWithLogo } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { Connection, PublicKey } from '@solana/web3.js'

import { buildSolanaTradeFlowContext } from './buildSolanaTradeFlowContext'

import { SolanaContextKey } from '../types/SolanaContextKey'
import { SolanaTradeFlowContext } from '../types/TradeFlowContext'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const SOLANA_ACCOUNT = '11111111111111111111111111111111'
const SELL_AMOUNT = 1_000_000_000n

const wsol = new TokenWithLogo(
  undefined,
  SupportedChainId.SOLANA,
  'So11111111111111111111111111111111111111112',
  9,
  'WSOL',
  'Wrapped SOL',
)
const usdc = new TokenWithLogo(
  undefined,
  SupportedChainId.SOLANA,
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  6,
  'USDC',
  'USD Coin',
)

const inputAmount = CurrencyAmount.fromRawAmount(wsol, SELL_AMOUNT.toString())
const outputAmount = CurrencyAmount.fromRawAmount(usdc, '150000000')
const solanaQuote = { uid: new Uint8Array(32).fill(7) }

const solana: SolanaTradeFlowContext['solana'] = {
  connection: {} as Connection,
  provider: {} as SolanaProvider,
  owner: new PublicKey(SOLANA_ACCOUNT),
}

const closeModals = jest.fn()
const dispatch = jest.fn() as unknown as SolanaContextKey[11]
const addTransaction = jest.fn() as unknown as SolanaContextKey[12]
const tradeConfirmActions = {} as SolanaTradeFlowContext['tradeConfirmActions']

const key = [
  SOLANA_ACCOUNT,
  SupportedChainId.SOLANA,
  { quoteResults: {}, solanaQuote } as unknown as SolanaContextKey[2],
  inputAmount,
  outputAmount,
  UiOrderType.SWAP,
  OrderKind.SELL,
  1_700_000_000,
  'recipient.eth',
  '0xrecipient',
  closeModals,
  dispatch,
  addTransaction,
  tradeConfirmActions,
  solana,
  wsol,
  42n,
  SELL_AMOUNT,
] as const satisfies SolanaContextKey

describe('buildSolanaTradeFlowContext', () => {
  it('lifts solanaQuote out of the quote so the flow can build the CreateOrder instruction', () => {
    expect(buildSolanaTradeFlowContext(key).solanaQuote).toBe(solanaQuote)
  })

  it('converts the sell amount to the bigint the step planners take', () => {
    expect(buildSolanaTradeFlowContext(key).sellAmount).toBe(SELL_AMOUNT)
  })

  it('carries the signer, sell token and delegation through to the flow', () => {
    const context = buildSolanaTradeFlowContext(key)

    expect(context.solana).toBe(solana)
    expect(context.sellToken).toBe(wsol)
    expect(context.currentDelegation).toBe(42n)
    expect(context.delegationAmount).toBe(SELL_AMOUNT)
  })

  it('builds the analytics market label from both symbols', () => {
    expect(buildSolanaTradeFlowContext(key).swapFlowAnalyticsContext).toEqual(
      expect.objectContaining({ marketLabel: 'WSOL,USDC', isBridgeOrder: false }),
    )
  })
})
