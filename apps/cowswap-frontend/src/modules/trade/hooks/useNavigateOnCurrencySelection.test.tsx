import { NATIVE_CURRENCIES, TokenWithLogo, USDC, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAINS, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAreThereTokensWithSameSymbol, useDoesSymbolResolveToToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'
import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useNavigateOnCurrencySelection } from './useNavigateOnCurrencySelection'
import { useTradeNavigate } from './useTradeNavigate'
import { useTradeState } from './useTradeState'

// Mock dependencies
jest.mock('@cowprotocol/tokens', () => ({
  useAreThereTokensWithSameSymbol: jest.fn(),
  useDoesSymbolResolveToToken: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('entities/bridgeProvider', () => ({
  useBridgeSupportedNetworks: jest.fn(),
}))

jest.mock('./useDerivedTradeState', () => ({
  useDerivedTradeState: jest.fn(),
}))

jest.mock('./useTradeNavigate', () => ({
  useTradeNavigate: jest.fn(),
}))

jest.mock('./useTradeState', () => ({
  useTradeState: jest.fn(),
}))

const mockedUseAreThereTokensWithSameSymbol = useAreThereTokensWithSameSymbol as jest.MockedFunction<
  typeof useAreThereTokensWithSameSymbol
>
const mockedUseDoesSymbolResolveToToken = useDoesSymbolResolveToToken as jest.MockedFunction<
  typeof useDoesSymbolResolveToToken
>
const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockedUseTradeNavigate = useTradeNavigate as jest.MockedFunction<typeof useTradeNavigate>
const mockedUseTradeState = useTradeState as jest.MockedFunction<typeof useTradeState>
const mockedUseBridgeSupportedNetworks = useBridgeSupportedNetworks as jest.MockedFunction<
  typeof useBridgeSupportedNetworks
>

// Test tokens
const WETH_MAINNET = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET]
const USDC_MAINNET = USDC[SupportedChainId.MAINNET]
const WETH_GNOSIS = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN]
const USDC_GNOSIS = USDC[SupportedChainId.GNOSIS_CHAIN]

// Assigned by setupDefaultMocks; defaults to "the symbol resolves back to this token", which is the
// case for any token already on an active list. Override per test to exercise the fallback.
let mockDoesSymbolResolveToToken: jest.Mock

function setupDefaultMocks(mockNavigate: jest.Mock, mockAreThereTokensWithSameSymbol: jest.Mock): void {
  mockedUseTradeNavigate.mockReturnValue(mockNavigate)
  mockedUseAreThereTokensWithSameSymbol.mockReturnValue(mockAreThereTokensWithSameSymbol)

  mockDoesSymbolResolveToToken = jest.fn().mockReturnValue(true)
  mockedUseDoesSymbolResolveToToken.mockReturnValue(mockDoesSymbolResolveToToken)

  mockedUseWalletInfo.mockReturnValue({
    chainId: SupportedChainId.MAINNET,
  } as never)

  mockedUseTradeState.mockReturnValue({
    state: {
      targetChainId: null,
    },
  } as never)

  mockedUseDerivedTradeState.mockReturnValue({
    inputCurrency: WETH_MAINNET,
    outputCurrency: USDC_MAINNET,
    orderKind: OrderKind.SELL,
  } as never)

  mockedUseBridgeSupportedNetworks.mockReturnValue({ data: ALL_SUPPORTED_CHAINS } as never)
}

describe('useNavigateOnCurrencySelection - basic', () => {
  let mockNavigate: jest.Mock
  let mockAreThereTokensWithSameSymbol: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate = jest.fn()
    mockAreThereTokensWithSameSymbol = jest.fn().mockReturnValue(false)
    setupDefaultMocks(mockNavigate, mockAreThereTokensWithSameSymbol)
  })

  describe('Basic currency selection', () => {
    it('should select input field currency with symbol when no duplicates', () => {
      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      const newToken = new TokenWithLogo(
        undefined,
        SupportedChainId.MAINNET,
        '0x1234567890123456789012345678901234567890',
        18,
        'DAI',
        'Dai Stablecoin',
      )

      act(() => {
        result.current(Field.INPUT, newToken)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: 'DAI',
          outputCurrencyId: USDC_MAINNET.symbol,
        },
        undefined,
      )
    })

    // Regression: the Coinbase RWA list ships AAPL at an address CoinGecko already ships as AAPLC, so
    // the symbol never resolves back and a symbol URL re-triggers the import prompt in a loop
    it('should use the address when the symbol does not resolve back to the token', () => {
      // only AAPL is unresolvable; the untouched WETH side must keep its symbol
      mockDoesSymbolResolveToToken.mockImplementation((symbol: string | null) => symbol !== 'AAPL')

      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      const address = '0xb200000000000000000000C2e324d24d7eEcd1fb'
      const newToken = new TokenWithLogo(
        undefined,
        SupportedChainId.MAINNET,
        address,
        18,
        'AAPL',
        'Apple (Coinbase Tokenized Stocks)',
      )

      act(() => {
        result.current(Field.OUTPUT, newToken)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: WETH_MAINNET.symbol,
          outputCurrencyId: address,
        },
        undefined,
      )
    })

    it('should keep the symbol for native currencies, which have no address to fall back to', () => {
      // false even for the native symbol: the hook must not consult this for native currencies
      mockDoesSymbolResolveToToken.mockImplementation((symbol: string | null) => symbol === USDC_MAINNET.symbol)

      const { result } = renderHook(() => useNavigateOnCurrencySelection())
      const native = NATIVE_CURRENCIES[SupportedChainId.MAINNET]

      act(() => {
        result.current(Field.INPUT, native)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: native.symbol,
          outputCurrencyId: USDC_MAINNET.symbol,
        },
        undefined,
      )
    })

    it('should select input field currency with address when duplicates exist', () => {
      mockAreThereTokensWithSameSymbol.mockReturnValue(true)

      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      const newToken = new TokenWithLogo(
        undefined,
        SupportedChainId.MAINNET,
        '0x1234567890123456789012345678901234567890',
        18,
        'USDC',
        'USD Coin',
      )

      act(() => {
        result.current(Field.INPUT, newToken)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: newToken.address,
          outputCurrencyId: USDC_MAINNET.address,
        },
        undefined,
      )
    })

    it('should select output field currency with symbol when no duplicates', () => {
      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      const newToken = new TokenWithLogo(
        undefined,
        SupportedChainId.MAINNET,
        '0x1234567890123456789012345678901234567890',
        18,
        'DAI',
        'Dai Stablecoin',
      )

      act(() => {
        result.current(Field.OUTPUT, newToken)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: WETH_MAINNET.symbol,
          outputCurrencyId: 'DAI',
        },
        undefined,
      )
    })

    it('should select output field currency with address when duplicates exist', () => {
      mockAreThereTokensWithSameSymbol.mockReturnValue(true)

      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      const newToken = new TokenWithLogo(
        undefined,
        SupportedChainId.MAINNET,
        '0x1234567890123456789012345678901234567890',
        18,
        'USDC',
        'USD Coin',
      )

      act(() => {
        result.current(Field.OUTPUT, newToken)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: WETH_MAINNET.address,
          outputCurrencyId: newToken.address,
        },
        undefined,
      )
    })
  })

  describe('Token inversion on same currency selection', () => {
    it('should invert tokens when selecting the same currency as input', () => {
      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      // Current state is WETH/USDC
      // Select USDC as input (currently it's the output)
      act(() => {
        result.current(Field.INPUT, USDC_MAINNET)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: USDC_MAINNET.symbol,
          outputCurrencyId: WETH_MAINNET.symbol,
        },
        undefined,
      )
    })

    it('should invert tokens when selecting the same currency as output', () => {
      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      // Current state is WETH/USDC
      // Select WETH as output (currently it's the input)
      act(() => {
        result.current(Field.OUTPUT, WETH_MAINNET)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: USDC_MAINNET.symbol,
          outputCurrencyId: WETH_MAINNET.symbol,
        },
        undefined,
      )
    })
  })
})

describe('useNavigateOnCurrencySelection - transient state loss (CS-104 regression)', () => {
  let mockNavigate: jest.Mock
  let mockAreThereTokensWithSameSymbol: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate = jest.fn()
    mockAreThereTokensWithSameSymbol = jest.fn().mockReturnValue(false)
    setupDefaultMocks(mockNavigate, mockAreThereTokensWithSameSymbol)
  })

  // A currency-picker click can land on a render where `useDerivedTradeState()`'s `inputCurrency`
  // and `useTradeState()`'s `state` (`tradeRawState`) are both transiently unavailable — e.g. the
  // latter's `EMPTY_TRADE_STATE` short-circuit when route classification hasn't caught up yet.
  // Without a sticky fallback, the already-selected sell token used to get wiped to the `_` "unset"
  // URL placeholder when the buy token was picked in that exact window.
  it('preserves the previously-known sell token when both inputCurrency and tradeRawState are transiently unavailable', () => {
    const { result, rerender } = renderHook(() => useNavigateOnCurrencySelection())

    // A prior, healthy render established WETH as the known sell token (via `setupDefaultMocks`).
    // Now simulate the transient render right as the click fires: both sources read as empty.
    mockedUseDerivedTradeState.mockReturnValue({
      inputCurrency: undefined,
      outputCurrency: USDC_MAINNET,
      orderKind: OrderKind.SELL,
    } as never)
    mockedUseTradeState.mockReturnValue({ state: undefined } as never)
    rerender()

    const newToken = new TokenWithLogo(
      undefined,
      SupportedChainId.MAINNET,
      '0x1234567890123456789012345678901234567890',
      18,
      'DAI',
      'Dai Stablecoin',
    )

    act(() => {
      result.current(Field.OUTPUT, newToken)
    })

    expect(mockNavigate).toHaveBeenCalledWith(
      SupportedChainId.MAINNET,
      {
        inputCurrencyId: WETH_MAINNET.symbol,
        outputCurrencyId: 'DAI',
      },
      undefined,
    )
  })

  it('preserves the previously-known buy token when both outputCurrency and tradeRawState are transiently unavailable', () => {
    const { result, rerender } = renderHook(() => useNavigateOnCurrencySelection())

    mockedUseDerivedTradeState.mockReturnValue({
      inputCurrency: WETH_MAINNET,
      outputCurrency: undefined,
      orderKind: OrderKind.SELL,
    } as never)
    mockedUseTradeState.mockReturnValue({ state: undefined } as never)
    rerender()

    const newToken = new TokenWithLogo(
      undefined,
      SupportedChainId.MAINNET,
      '0x1234567890123456789012345678901234567890',
      18,
      'DAI',
      'Dai Stablecoin',
    )

    act(() => {
      result.current(Field.INPUT, newToken)
    })

    expect(mockNavigate).toHaveBeenCalledWith(
      SupportedChainId.MAINNET,
      {
        inputCurrencyId: 'DAI',
        outputCurrencyId: USDC_MAINNET.symbol,
      },
      undefined,
    )
  })
})

describe('useNavigateOnCurrencySelection - cross-chain', () => {
  let mockNavigate: jest.Mock
  let mockAreThereTokensWithSameSymbol: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate = jest.fn()
    mockAreThereTokensWithSameSymbol = jest.fn().mockReturnValue(false)
    setupDefaultMocks(mockNavigate, mockAreThereTokensWithSameSymbol)
  })

  describe('Chain switching scenarios', () => {
    it('should preserve buy token when selecting input currency from different chain and buy was on same chain as sell', () => {
      // Default state: wallet on Mainnet, sell=WETH_MAINNET, buy=USDC_MAINNET (same-chain swap)
      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      // Select token from Gnosis Chain as input → sell chain changes
      // Even though buy token (USDC_MAINNET) was on the same chain as the old sell (Mainnet),
      // this is a valid bridge destination and should be preserved.
      act(() => {
        result.current(Field.INPUT, WETH_GNOSIS)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.GNOSIS_CHAIN,
        {
          inputCurrencyId: WETH_GNOSIS.address,
          outputCurrencyId: USDC_MAINNET.address,
        },
        { targetChainId: SupportedChainId.MAINNET },
      )
    })

    it('should preserve buy token when switching sell chain and buy was already on a different chain (cross-chain)', () => {
      // Setup: existing bridge trade - sell on Mainnet, buy on Gnosis
      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: WETH_MAINNET,
        outputCurrency: USDC_GNOSIS,
        orderKind: OrderKind.SELL,
      } as never)

      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      const WETH_ARB = new TokenWithLogo(
        undefined,
        SupportedChainId.ARBITRUM_ONE,
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        18,
        'WETH',
        'Wrapped Ether',
      )
      mockAreThereTokensWithSameSymbol.mockReturnValue(true)

      // Select token from Arbitrum as input → sell chain changes
      // Buy token (USDC_GNOSIS) was already on a different chain than sell (Mainnet),
      // so it's an intentional cross-chain setup and should be preserved
      act(() => {
        result.current(Field.INPUT, WETH_ARB)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.ARBITRUM_ONE,
        {
          inputCurrencyId: WETH_ARB.address,
          outputCurrencyId: USDC_GNOSIS.address,
        },
        { targetChainId: SupportedChainId.GNOSIS_CHAIN },
      )
    })

    it('should not reset buy token when selecting output currency from different chain', () => {
      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      // Select token from Gnosis Chain as output
      act(() => {
        result.current(Field.OUTPUT, USDC_GNOSIS)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: WETH_MAINNET.symbol,
          outputCurrencyId: USDC_GNOSIS.address,
        },
        { targetChainId: SupportedChainId.GNOSIS_CHAIN },
      )
    })

    it('should preserve targetChainId when selecting input currency', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: WETH_MAINNET,
        outputCurrency: USDC_GNOSIS,
        orderKind: OrderKind.SELL,
      } as never)
      mockedUseTradeState.mockReturnValue({
        state: {
          targetChainId: USDC_GNOSIS.chainId,
        },
      } as never)

      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      const newToken = new TokenWithLogo(
        undefined,
        SupportedChainId.MAINNET,
        '0x1234567890123456789012345678901234567890',
        18,
        'DAI',
        'Dai Stablecoin',
      )

      act(() => {
        result.current(Field.INPUT, newToken)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: 'DAI',
          outputCurrencyId: USDC_GNOSIS.address,
        },
        { targetChainId: USDC_GNOSIS.chainId },
      )
    })
  })

  describe('Buy order reset in bridging mode', () => {
    it('should reset buy order when selecting output currency from different chain with BUY order', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: WETH_MAINNET,
        outputCurrency: USDC_MAINNET,
        orderKind: OrderKind.BUY,
      } as never)

      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      // Select token from Gnosis Chain as output with BUY order
      act(() => {
        result.current(Field.OUTPUT, USDC_GNOSIS)
      })
      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: WETH_MAINNET.symbol,
          outputCurrencyId: USDC_GNOSIS.address,
        },
        {
          targetChainId: SupportedChainId.GNOSIS_CHAIN,
          kind: OrderKind.SELL,
          amount: '1',
        },
      )
    })

    it('should not reset order when selecting output currency from different chain with SELL order', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: WETH_MAINNET,
        outputCurrency: USDC_MAINNET,
        orderKind: OrderKind.SELL,
      } as never)

      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      act(() => {
        result.current(Field.OUTPUT, USDC_GNOSIS)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: WETH_MAINNET.symbol,
          outputCurrencyId: USDC_GNOSIS.address,
        },
        { targetChainId: SupportedChainId.GNOSIS_CHAIN },
      )
    })
  })
})
