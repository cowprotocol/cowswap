import { OrderKind, QuoteAndPost, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { getIsSolanaTradeFlowContextReady } from './getIsSolanaTradeFlowContextReady'
import { resolveSolanaReceiver } from './useSolanaTradeFlowContext'

// The canonical Solana System Program address (32 zero bytes) — always a valid
// Solana pubkey, used here purely as "some syntactically valid Solana address".
const SOLANA_ADDRESS = '11111111111111111111111111111111'
const EVM_CHAIN_ID = SupportedChainId.MAINNET

const token = new Token(EVM_CHAIN_ID, '0x0000000000000000000000000000000000000001', 18, 'FOO')
const amount = CurrencyAmount.fromRawAmount(token, '1000')
// Readiness requires a Solana quote specifically: `solanaQuote` carries the intent/PDA the
// CreateOrder instruction is built from.
const quote = { solanaQuote: {} } as unknown as QuoteAndPost

describe('getIsSolanaTradeFlowContextReady', () => {
  const readyParams = {
    chainId: SupportedChainId.SOLANA,
    account: SOLANA_ADDRESS,
    inputAmount: amount,
    outputAmount: amount,
    quote,
    isFinalQuote: true,
    uiOrderType: UiOrderType.SWAP,
    orderKind: OrderKind.SELL,
    validTo: 1_700_000_000,
    hasSolanaSigner: true,
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

  it('is not ready when the quote carries no solanaQuote', () => {
    expect(getIsSolanaTradeFlowContextReady({ ...readyParams, quote: {} as QuoteAndPost })).toBe(false)
  })

  it('is not ready without a Solana connection, provider and sell token', () => {
    expect(getIsSolanaTradeFlowContextReady({ ...readyParams, hasSolanaSigner: false })).toBe(false)
  })

  it('is not ready when the quote is only the fast preview quote', () => {
    expect(getIsSolanaTradeFlowContextReady({ ...readyParams, isFinalQuote: false })).toBe(false)
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

describe('resolveSolanaReceiver', () => {
  // Mirrors swapFlow's `orderParams.recipient = recipientAddress || recipient || account`, so a
  // custom recipient set after quoting is forwarded to postSwapOrderFromQuote the same way EVM does.
  it('prefers the resolved recipient address when set', () => {
    expect(
      resolveSolanaReceiver({ recipient: 'some-name', recipientAddress: SOLANA_ADDRESS, account: 'self-address' }),
    ).toBe(SOLANA_ADDRESS)
  })

  it('falls back to the raw recipient when there is no resolved address', () => {
    expect(
      resolveSolanaReceiver({ recipient: SOLANA_ADDRESS, recipientAddress: undefined, account: 'self-address' }),
    ).toBe(SOLANA_ADDRESS)
  })

  it('falls back to the connected account when there is no custom recipient (default: send to self)', () => {
    expect(resolveSolanaReceiver({ recipient: undefined, recipientAddress: undefined, account: 'self-address' })).toBe(
      'self-address',
    )
  })
})
