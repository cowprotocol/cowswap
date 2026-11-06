import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { useDerivedTradeState, useGetReceiveAmountInfo, useIsWrapOrUnwrap } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

import { useSolanaNativeShortfall } from './useSolanaNativeShortfall'
import { useSolanaTradeOverhead } from './useSolanaTradeOverhead'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('modules/combinedBalances', () => ({
  useTokensBalancesCombined: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useDerivedTradeState: jest.fn(),
  useGetReceiveAmountInfo: jest.fn(),
  useIsWrapOrUnwrap: jest.fn(),
  getIsNativeSellUnsupported: jest.requireActual('modules/trade/utils/getIsNativeSellUnsupported')
    .getIsNativeSellUnsupported,
}))

jest.mock('./useSolanaTradeOverhead', () => ({
  useSolanaTradeOverhead: jest.fn(),
}))

const mockUseWalletInfo = jest.mocked(useWalletInfo)
const mockUseTokensBalancesCombined = jest.mocked(useTokensBalancesCombined)
const mockUseDerivedTradeState = jest.mocked(useDerivedTradeState)
const mockUseGetReceiveAmountInfo = jest.mocked(useGetReceiveAmountInfo)
const mockUseIsWrapOrUnwrap = jest.mocked(useIsWrapOrUnwrap)
const mockUseSolanaTradeOverhead = jest.mocked(useSolanaTradeOverhead)

const NATIVE_SOL = NATIVE_CURRENCIES[SupportedChainId.SOLANA] as unknown as Currency
const SOLANA_USDC = new Token(SupportedChainId.SOLANA, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')

const BALANCE = 1_000_000_000n
const OVERHEAD = 5_000_000n
// Enough on its own to exhaust the balance, so a shortfall is reported whenever it is counted.
const SELL_AMOUNT = CurrencyAmount.fromRawAmount(NATIVE_SOL, BALANCE.toString())

function setup({ inputCurrency, tradeType }: { inputCurrency: Currency; tradeType: TradeType }): void {
  mockUseDerivedTradeState.mockReturnValue({
    inputCurrency,
    tradeType,
    inputCurrencyAmount: SELL_AMOUNT,
  } as unknown as ReturnType<typeof useDerivedTradeState>)
  mockUseGetReceiveAmountInfo.mockReturnValue({
    amountsToSign: { sellAmount: SELL_AMOUNT },
  } as unknown as ReturnType<typeof useGetReceiveAmountInfo>)
}

describe('useSolanaNativeShortfall', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.SOLANA } as ReturnType<typeof useWalletInfo>)
    mockUseTokensBalancesCombined.mockReturnValue({
      values: { [getAddressKey(NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)]: BALANCE },
    } as unknown as ReturnType<typeof useTokensBalancesCombined>)
    mockUseIsWrapOrUnwrap.mockReturnValue(false)
    mockUseSolanaTradeOverhead.mockReturnValue({ required: OVERHEAD, maxReserve: OVERHEAD } as ReturnType<
      typeof useSolanaTradeOverhead
    >)
    setup({ inputCurrency: NATIVE_SOL, tradeType: TradeType.SWAP })
  })

  it('reports the shortfall for a native sell in SWAP', () => {
    const { result } = renderHook(() => useSolanaNativeShortfall())

    expect(result.current?.quotient.toString()).toBe(OVERHEAD.toString())
  })

  it('reports the shortfall for an SPL sell in a limit order', () => {
    setup({ inputCurrency: SOLANA_USDC, tradeType: TradeType.LIMIT_ORDER })

    const { result } = renderHook(() => useSolanaNativeShortfall())

    // The sell amount is not native, so only the overhead is weighed against the balance
    expect(result.current).toBe(null)

    mockUseTokensBalancesCombined.mockReturnValue({
      values: { [getAddressKey(NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)]: 0n },
    } as unknown as ReturnType<typeof useTokensBalancesCombined>)

    const { result: withoutBalance } = renderHook(() => useSolanaNativeShortfall())

    expect(withoutBalance.current?.quotient.toString()).toBe(OVERHEAD.toString())
  })

  it('reports no shortfall for a native sell in a limit order, so the native-sell block is not masked', () => {
    setup({ inputCurrency: NATIVE_SOL, tradeType: TradeType.LIMIT_ORDER })

    const { result } = renderHook(() => useSolanaNativeShortfall())

    expect(result.current).toBe(null)
  })

  it('keeps reporting the shortfall for a native wrap in a limit order', () => {
    setup({ inputCurrency: NATIVE_SOL, tradeType: TradeType.LIMIT_ORDER })
    mockUseIsWrapOrUnwrap.mockReturnValue(true)

    const { result } = renderHook(() => useSolanaNativeShortfall())

    expect(result.current?.quotient.toString()).toBe(OVERHEAD.toString())
  })
})
