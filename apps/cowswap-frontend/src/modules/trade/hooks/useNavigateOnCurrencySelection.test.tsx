import { TokenWithLogo, USDC, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAreThereTokensWithSameSymbol } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

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

// Test tokens
const WETH_MAINNET = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET]
const USDC_MAINNET = USDC[SupportedChainId.MAINNET]
const WETH_GNOSIS = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN]
const USDC_GNOSIS = USDC[SupportedChainId.GNOSIS_CHAIN]

describe('useNavigateOnCurrencySelection', () => {
  let mockNavigate: jest.Mock
  let mockAreThereTokensWithSameSymbol: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockNavigate = jest.fn()
    mockAreThereTokensWithSameSymbol = jest.fn().mockReturnValue(false)

    mockedUseTradeNavigate.mockReturnValue(mockNavigate)
    mockedUseAreThereTokensWithSameSymbol.mockReturnValue(mockAreThereTokensWithSameSymbol)

    // Default setup
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

      result.current(Field.INPUT, newToken)

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

      result.current(Field.INPUT, newToken)

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

      result.current(Field.OUTPUT, newToken)

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

      result.current(Field.OUTPUT, newToken)

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
      result.current(Field.INPUT, USDC_MAINNET)

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
      result.current(Field.OUTPUT, WETH_MAINNET)

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

  describe('Chain switching scenarios', () => {
    it('should switch chain and keep buy token when selecting input currency from different chain', () => {
      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      // Select token from Gnosis Chain as input
      result.current(Field.INPUT, WETH_GNOSIS)

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.GNOSIS_CHAIN,
        {
          inputCurrencyId: WETH_GNOSIS.symbol,
          outputCurrencyId: USDC_MAINNET.address,
        },
        { targetChainId: SupportedChainId.MAINNET },
      )
    })

    it('should not reset buy token when selecting output currency from different chain', () => {
      const { result } = renderHook(() => useNavigateOnCurrencySelection())

      // Select token from Gnosis Chain as output
      result.current(Field.OUTPUT, USDC_GNOSIS)

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
      mockedUseTradeState.mockReturnValue({
        state: {
          targetChainId: SupportedChainId.BASE,
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

      result.current(Field.INPUT, newToken)

      expect(mockNavigate).toHaveBeenCalledWith(
        SupportedChainId.MAINNET,
        {
          inputCurrencyId: 'DAI',
          outputCurrencyId: USDC_MAINNET.symbol,
        },
        { targetChainId: SupportedChainId.BASE },
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
      result.current(Field.OUTPUT, USDC_GNOSIS)

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

      result.current(Field.OUTPUT, USDC_GNOSIS)

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
