import { TokenWithLogo, USDC, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAINS, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAreThereTokensWithSameSymbol } from '@cowprotocol/tokens'
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

function setupDefaultMocks(mockNavigate: jest.Mock, mockAreThereTokensWithSameSymbol: jest.Mock): void {
  mockedUseTradeNavigate.mockReturnValue(mockNavigate)
  mockedUseAreThereTokensWithSameSymbol.mockReturnValue(mockAreThereTokensWithSameSymbol)

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
    it('should clear buy token when selecting input currency from different chain and buy was on same chain as sell', () => {
      // Default state: wallet on Mainnet, sell=WETH_MAINNET, buy=USDC_MAINNET (same-chain swap)
      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      // Select token from Gnosis Chain as input → sell chain changes
      // Since buy token (USDC_MAINNET) was on the same chain as the old sell (Mainnet),
      // it should be cleared to avoid a stale bridge trade
      act(() => {
        result.current(Field.INPUT, WETH_GNOSIS)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.GNOSIS_CHAIN,
        {
          inputCurrencyId: WETH_GNOSIS.symbol,
          outputCurrencyId: null,
        },
        undefined,
      )
    })

    it('should clear buy token when wallet chain differs from sell chain and buy was on same chain as sell', () => {
      // Edge case: wallet on Mainnet, but current trade is Gnosis→Gnosis (same-chain swap on non-wallet chain)
      // The buy token should be cleared because it was on the same chain as the sell token,
      // NOT because it matches the wallet chain.
      mockedUseWalletInfo.mockReturnValue({
        chainId: SupportedChainId.MAINNET,
      } as never)
      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: WETH_GNOSIS,
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

      // Select Arbitrum token as input → sell chain changes from Gnosis to Arbitrum
      // Buy (USDC_GNOSIS) was on the same chain as sell (WETH_GNOSIS) → should be cleared
      act(() => {
        result.current(Field.INPUT, WETH_ARB)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.ARBITRUM_ONE,
        {
          inputCurrencyId: WETH_ARB.symbol,
          outputCurrencyId: null,
        },
        undefined,
      )
    })

    it('should clear buy token when switching sell back to wallet chain from non-wallet-chain trade', () => {
      // Edge case: wallet on Mainnet, current trade is Gnosis→Gnosis
      // User switches sell to a Mainnet token (back to wallet chain).
      // Even though targetChainMismatch is false (new sell chain == wallet chain),
      // the sell chain IS changing (Gnosis→Mainnet), so the stale Gnosis buy should be cleared.
      mockedUseWalletInfo.mockReturnValue({
        chainId: SupportedChainId.MAINNET,
      } as never)
      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: WETH_GNOSIS,
        outputCurrency: USDC_GNOSIS,
        orderKind: OrderKind.SELL,
      } as never)

      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      act(() => {
        result.current(Field.INPUT, WETH_MAINNET)
      })

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: WETH_MAINNET.symbol,
          outputCurrencyId: null,
        },
        undefined,
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
