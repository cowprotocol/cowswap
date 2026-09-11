import { TokenWithLogo } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { Connection, PublicKey } from '@solana/web3.js'

import { buildSolanaContextKey } from './buildSolanaContextKey'

import { SolanaContextKeyParams } from '../types/SolanaContextKey'
import { SolanaTradeFlowContext } from '../types/TradeFlowContext'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const SOLANA_ACCOUNT = '11111111111111111111111111111111'

const wsol = new TokenWithLogo(
  undefined,
  SupportedChainId.SOLANA,
  'So11111111111111111111111111111111111111112',
  9,
  'WSOL',
  'Wrapped SOL',
)
const amount = CurrencyAmount.fromRawAmount(wsol, '1000000000')

const solana: SolanaTradeFlowContext['solana'] = {
  connection: {} as Connection,
  provider: {} as SolanaProvider,
  owner: new PublicKey(SOLANA_ACCOUNT),
}

const completeParams: SolanaContextKeyParams = {
  isFinalQuote: true,
  account: SOLANA_ACCOUNT,
  chainId: SupportedChainId.SOLANA,
  quote: { solanaQuote: {} } as unknown as SolanaContextKeyParams['quote'],
  inputAmount: amount,
  outputAmount: amount,
  uiOrderType: UiOrderType.SWAP,
  orderKind: OrderKind.SELL,
  validTo: 1_700_000_000,
  recipient: null,
  recipientAddress: null,
  closeModals: jest.fn(),
  dispatch: jest.fn() as unknown as SolanaContextKeyParams['dispatch'],
  addTransaction: jest.fn() as unknown as SolanaContextKeyParams['addTransaction'],
  tradeConfirmActions: {} as SolanaTradeFlowContext['tradeConfirmActions'],
  solana,
  sellToken: wsol,
  currentDelegation: 5n,
  delegationAmount: 1_000_000_000n,
  isNativeSell: true,
}

describe('buildSolanaContextKey', () => {
  it('returns a complete key when every dependency is resolved', () => {
    const key = buildSolanaContextKey(completeParams)

    expect(key).not.toBeNull()
    expect(key?.[0]).toBe(SOLANA_ACCOUNT)
    expect(key?.[15]).toBe(wsol)
    expect(key?.[16]).toBe(5n)
    expect(key?.[17]).toBe(1_000_000_000n)
  })

  it('changes the key when the user picks a different approve amount, so the context rebuilds', () => {
    const key = buildSolanaContextKey(completeParams)
    const withMoreApproved = buildSolanaContextKey({ ...completeParams, delegationAmount: 2n ** 64n - 1n })

    expect(withMoreApproved?.[17]).toBe(2n ** 64n - 1n)
    expect(withMoreApproved).not.toEqual(key)
  })

  it('defaults a missing delegation to zero so the delegate step is planned', () => {
    const key = buildSolanaContextKey({ ...completeParams, currentDelegation: undefined })

    expect(key?.[16]).toBe(0n)
  })

  it.each([
    ['a non-final quote', { isFinalQuote: false }],
    ['no account', { account: undefined }],
    ['no Solana signer', { solana: null }],
    ['no sell token', { sellToken: undefined }],
    ['no input amount', { inputAmount: undefined }],
    ['no output amount', { outputAmount: undefined }],
    ['a non-Solana quote', { quote: {} as SolanaContextKeyParams['quote'] }],
    ['no quote at all', { quote: null }],
  ])('returns null with %s, so the flow never runs partially resolved', (_label, override) => {
    expect(buildSolanaContextKey({ ...completeParams, ...override })).toBeNull()
  })
})
