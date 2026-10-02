import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Percent } from '@cowprotocol/currency'
import { useTokenByAddress } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useTradeQuote } from 'modules/tradeQuote'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useSwapReceiveAmountInfoParams } from './useGetSwapReceiveAmountInfo'

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: () => ({}),
}))

jest.mock('@cowprotocol/tokens', () => ({
  useTokenByAddress: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
  isEoaAtom: jest.requireActual('jotai').atom(false),
}))

jest.mock('modules/appData', () => ({
  useAppData: () => undefined,
}))

jest.mock('modules/volumeFee', () => ({
  useVolumeFee: () => undefined,
}))

jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: jest.fn(),
  useTradeQuoteProtocolFee: () => 0,
  getEoaTwapQuotePreHooks: () => [],
  applyUnpricedHookGasToOrderParams: (orderParams: unknown) => orderParams,
  // The real predicate, so these cases exercise how a Solana quote is actually recognised.
  isSolanaQuoteAndPost: jest.requireActual('modules/tradeQuote/types').isSolanaQuoteAndPost,
}))

jest.mock('./useDerivedTradeState', () => ({
  useDerivedTradeState: jest.fn(),
}))

const mockUseTokenByAddress = useTokenByAddress as jest.MockedFunction<typeof useTokenByAddress>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>

const NATIVE_SOL = '11111111111111111111111111111111'
const WSOL = 'So11111111111111111111111111111111111111112'
const USDT_SOLANA = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'

function setup({
  walletChainId = SupportedChainId.MAINNET,
  isSolanaQuote,
  sellToken = USDT_SOLANA,
  quoteBuyToken,
  requestedBuyToken,
}: {
  walletChainId?: SupportedChainId
  isSolanaQuote: boolean
  sellToken?: string
  quoteBuyToken: string
  requestedBuyToken: string
}): void {
  mockUseWalletInfo.mockReturnValue({ chainId: walletChainId, account: undefined } as ReturnType<typeof useWalletInfo>)
  mockUseDerivedTradeState.mockReturnValue({
    orderKind: OrderKind.SELL,
    slippage: new Percent(50, 10_000),
  } as ReturnType<typeof useDerivedTradeState>)
  mockUseTradeQuote.mockReturnValue({
    quote: {
      // `isSolanaQuoteAndPost` keys off this property's presence, which is what tells the hook the
      // quote came from `getSolanaQuote` and therefore carries a substituted buy mint.
      ...(isSolanaQuote ? { solanaQuote: {} } : undefined),
      quoteResults: {
        quoteResponse: {
          quote: {
            kind: OrderKind.SELL,
            sellToken,
            buyToken: quoteBuyToken,
            sellAmount: '1000000',
            buyAmount: '2000000',
            feeAmount: '0',
          },
        },
        tradeParameters: { buyToken: requestedBuyToken },
      },
    },
  } as ReturnType<typeof useTradeQuote>)
}

describe('useSwapReceiveAmountInfoParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Echo the looked-up address back so the assertions can tell which mint was resolved.
    mockUseTokenByAddress.mockImplementation((address) => (address ? ({ address } as TokenWithLogo) : null))
  })

  // The Solana quote is priced against WSOL for a native-SOL buy, but settlement credits lamports.
  // Labelling the amounts with the quote's mint showed "Received 0.17 WSOL" on the result screen and
  // in the activity list for an order that paid out native SOL.
  it('labels a native SOL buy with the mint the user asked for, not the WSOL the quote was priced in', () => {
    setup({ isSolanaQuote: true, quoteBuyToken: WSOL, requestedBuyToken: NATIVE_SOL })

    const { result } = renderHook(() => useSwapReceiveAmountInfoParams())

    expect(result.current?.outputCurrency?.address).toBe(NATIVE_SOL)
  })

  it('leaves an SPL buy on the mint the quote names', () => {
    setup({ isSolanaQuote: true, quoteBuyToken: WSOL, requestedBuyToken: WSOL })

    const { result } = renderHook(() => useSwapReceiveAmountInfoParams())

    expect(result.current?.outputCurrency?.address).toBe(WSOL)
  })

  // The quote is selected from the token chain (`fetchAndProcessQuote` branches on
  // `sellTokenChainId`), while the connected wallet can sit on any chain. Reading the wallet chain
  // here would drop back to the quote's WSOL whenever the two disagree.
  it('does not depend on the connected wallet chain', () => {
    setup({
      isSolanaQuote: true,
      walletChainId: SupportedChainId.MAINNET,
      quoteBuyToken: WSOL,
      requestedBuyToken: NATIVE_SOL,
    })

    const { result } = renderHook(() => useSwapReceiveAmountInfoParams())

    expect(result.current?.outputCurrency?.address).toBe(NATIVE_SOL)
  })

  it('keeps reading the quote response for a non-Solana quote', () => {
    const daiMainnet = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    const wethMainnet = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    setup({
      isSolanaQuote: false,
      sellToken: daiMainnet,
      quoteBuyToken: wethMainnet,
      requestedBuyToken: daiMainnet,
    })

    const { result } = renderHook(() => useSwapReceiveAmountInfoParams())

    expect(result.current?.outputCurrency?.address).toBe(getAddressKey(wethMainnet))
  })
})
