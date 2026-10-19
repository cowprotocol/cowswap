import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useTradeQuote } from 'modules/tradeQuote'

import { TradeType } from 'common/modules/tradeNavigation'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsFreeOrderPlacement } from './useIsFreeOrderPlacement'

jest.mock('@cowprotocol/common-hooks')
jest.mock('@cowprotocol/wallet')
jest.mock('./useDerivedTradeState')
jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: jest.fn(),
  isSolanaQuoteAndPost: (quote: unknown) => !!quote && typeof quote === 'object' && 'solanaQuote' in quote,
}))

const mockedUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockedUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>

interface Scenario {
  chainId: SupportedChainId
  tradeType: TradeType
  sponsoringEnabled?: boolean
  hasFunder?: boolean
}

function setup({ chainId, tradeType, sponsoringEnabled = false, hasFunder = false }: Scenario): boolean {
  mockedUseWalletInfo.mockReturnValue({ chainId } as ReturnType<typeof useWalletInfo>)
  mockedUseFeatureFlags.mockReturnValue({ isSolanaSponsoredOrdersEnabled: sponsoringEnabled })
  mockedUseDerivedTradeState.mockReturnValue({ tradeType } as ReturnType<typeof useDerivedTradeState>)
  mockedUseTradeQuote.mockReturnValue({
    quote: { solanaQuote: hasFunder ? { funder: {} } : {} },
  } as ReturnType<typeof useTradeQuote>)

  return renderHook(() => useIsFreeOrderPlacement()).result.current
}

describe('useIsFreeOrderPlacement', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('is free on a sponsored Solana swap — the funder pays the rent and the fee', () => {
    expect(
      setup({ chainId: SupportedChainId.SOLANA, tradeType: TradeType.SWAP, sponsoringEnabled: true, hasFunder: true }),
    ).toBe(true)
  })

  it('is not free on a Solana swap once sponsoring is off', () => {
    expect(
      setup({ chainId: SupportedChainId.SOLANA, tradeType: TradeType.SWAP, sponsoringEnabled: false, hasFunder: true }),
    ).toBe(false)
  })

  it('is not free on a Solana swap whose quote came back without a funder', () => {
    expect(
      setup({ chainId: SupportedChainId.SOLANA, tradeType: TradeType.SWAP, sponsoringEnabled: true, hasFunder: false }),
    ).toBe(false)
  })

  // Sponsoring never covers limit orders, so the owner pays even with the flag on and a funder present.
  it('is not free on a Solana limit order regardless of the flag', () => {
    expect(
      setup({
        chainId: SupportedChainId.SOLANA,
        tradeType: TradeType.LIMIT_ORDER,
        sponsoringEnabled: true,
        hasFunder: true,
      }),
    ).toBe(false)
  })

  // Placement on EVM is an off-chain signature, so it stays free and must not regress with the Solana change.
  it('is free on an EVM swap', () => {
    expect(setup({ chainId: SupportedChainId.MAINNET, tradeType: TradeType.SWAP })).toBe(true)
  })

  it('is free on an EVM limit order', () => {
    expect(setup({ chainId: SupportedChainId.MAINNET, tradeType: TradeType.LIMIT_ORDER })).toBe(true)
  })
})
