import { OrderKind, PriceQuality, QuoteAndPost, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { getIsSolanaTradeFlowContextReady } from './useSolanaTradeFlowContext'

// The canonical Solana System Program address (32 zero bytes) — always a valid
// Solana pubkey, used here purely as "some syntactically valid Solana address".
const SOLANA_ADDRESS = '11111111111111111111111111111111'
const EVM_CHAIN_ID = SupportedChainId.MAINNET

const token = new Token(EVM_CHAIN_ID, '0x0000000000000000000000000000000000000001', 18, 'FOO')
const amount = CurrencyAmount.fromRawAmount(token, '1000')
const quote = {} as QuoteAndPost

describe('getIsSolanaTradeFlowContextReady', () => {
  const readyParams = {
    chainId: SupportedChainId.SOLANA,
    account: SOLANA_ADDRESS,
    inputAmount: amount,
    outputAmount: amount,
    quote,
    priceQuality: PriceQuality.OPTIMAL,
    uiOrderType: UiOrderType.SWAP,
    orderKind: OrderKind.SELL,
    validTo: 1_700_000_000,
  }

  it('is ready when every condition is met', () => {
    expect(getIsSolanaTradeFlowContextReady(readyParams)).toBe(true)
  })

  it('is not ready when the chain is not Solana', () => {
    expect(getIsSolanaTradeFlowContextReady({ ...readyParams, chainId: EVM_CHAIN_ID })).toBe(false)
  })

  it('is not ready when the account is not a Solana address', () => {
    expect(getIsSolanaTradeFlowContextReady({ ...readyParams, account: '0x000...' })).toBe(false)
  })

  it('is not ready when there is no quote yet', () => {
    expect(getIsSolanaTradeFlowContextReady({ ...readyParams, quote: null })).toBe(false)
  })

  it('is not ready when the quote is not the OPTIMAL price quality', () => {
    expect(getIsSolanaTradeFlowContextReady({ ...readyParams, priceQuality: PriceQuality.FAST })).toBe(false)
  })

  it('is not ready when amounts are missing', () => {
    expect(getIsSolanaTradeFlowContextReady({ ...readyParams, inputAmount: undefined })).toBe(false)
  })

  it('is not ready when the order kind is missing', () => {
    expect(getIsSolanaTradeFlowContextReady({ ...readyParams, orderKind: undefined })).toBe(false)
  })

  it('is not ready when validTo is not set', () => {
    expect(getIsSolanaTradeFlowContextReady({ ...readyParams, validTo: 0 })).toBe(false)
  })
})
