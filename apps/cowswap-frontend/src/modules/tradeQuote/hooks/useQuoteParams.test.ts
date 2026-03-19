import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { renderHook } from '@testing-library/react'

import { useAppData } from 'modules/appData'
import { TradeDerivedState, useDerivedTradeState, useIsWrapOrUnwrap } from 'modules/trade'
import { useTradeSlippageValueAndType } from 'modules/tradeSlippage'
import { useVolumeFee } from 'modules/volumeFee'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useQuoteParams } from './useQuoteParams'
import { useQuoteParamsRecipient } from './useQuoteParamsRecipient'

import { BRIDGE_QUOTE_ACCOUNT } from '../utils/getBridgeQuoteSigner'

// Mock all dependencies
jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('@cowprotocol/wallet-provider', () => ({ useWalletProvider: jest.fn() }))
jest.mock('@cowprotocol/common-hooks', () => ({
  useDebounce: <T>(value: T) => value,
}))
jest.mock('@cowprotocol/common-utils', () => ({
  COW_PROTOCOL_ETH_FLOW_ADDRESS: { 1: '0xethflow' },
  getCurrencyAddress: (c: { address?: string; isNative?: boolean }) => c.address || '0xnative',
}))
jest.mock('@cowprotocol/common-const', () => ({
  DEFAULT_APP_CODE: 'CoW Swap',
}))
jest.mock('modules/appData', () => ({ useAppData: jest.fn() }))
jest.mock('modules/trade', () => ({
  useDerivedTradeState: jest.fn(),
  useIsWrapOrUnwrap: jest.fn(),
}))
jest.mock('modules/tradeSlippage', () => ({ useTradeSlippageValueAndType: jest.fn() }))
jest.mock('modules/volumeFee', () => ({ useVolumeFee: jest.fn() }))
jest.mock('common/hooks/useIsProviderNetworkDeprecated', () => ({
  useIsProviderNetworkDeprecated: jest.fn(),
}))
jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({
  useIsProviderNetworkUnsupported: jest.fn(),
}))
jest.mock('./useQuoteParamsRecipient', () => ({ useQuoteParamsRecipient: jest.fn() }))
jest.mock('../utils/getBridgeQuoteSigner', () => ({
  BRIDGE_QUOTE_ACCOUNT: '0xBridgeQuoteAccount',
  getBridgeQuoteSigner: jest.fn().mockReturnValue('mock-signer'),
}))
jest.mock('common/hooks/useSafeMemo', () => ({
  useSafeMemo: (fn: () => unknown, _deps: unknown[]) => fn(),
}))

const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseWalletProvider = useWalletProvider as jest.MockedFunction<typeof useWalletProvider>
const mockedUseAppData = useAppData as jest.MockedFunction<typeof useAppData>
const mockedUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockedUseIsWrapOrUnwrap = useIsWrapOrUnwrap as jest.MockedFunction<typeof useIsWrapOrUnwrap>
const mockedUseTradeSlippage = useTradeSlippageValueAndType as jest.MockedFunction<typeof useTradeSlippageValueAndType>
const mockedUseVolumeFee = useVolumeFee as jest.MockedFunction<typeof useVolumeFee>
const mockedUseIsProviderNetworkUnsupported = useIsProviderNetworkUnsupported as jest.MockedFunction<
  typeof useIsProviderNetworkUnsupported
>
const mockedUseIsProviderNetworkDeprecated = useIsProviderNetworkDeprecated as jest.MockedFunction<
  typeof useIsProviderNetworkDeprecated
>
const mockedUseQuoteParamsRecipient = useQuoteParamsRecipient as jest.MockedFunction<typeof useQuoteParamsRecipient>

const ACCOUNT_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
const SELL_TOKEN = '0x1111111111111111111111111111111111111111'
const BUY_TOKEN = '0x2222222222222222222222222222222222222222'
const SOLANA_ADDRESS = '9WfjPKjYvK5iPYzWetNVuHUArE9nBxuwtfXLoW8xhkQT'

const mockProvider = { getSigner: jest.fn().mockReturnValue('user-signer') }

const mockInputCurrency = {
  chainId: SupportedChainId.MAINNET,
  decimals: 18,
  address: SELL_TOKEN,
  isNative: false,
  symbol: 'WETH',
  name: 'Wrapped Ether',
}

const mockOutputCurrency = {
  chainId: SupportedChainId.MAINNET,
  decimals: 6,
  address: BUY_TOKEN,
  isNative: false,
  symbol: 'USDC',
  name: 'USD Coin',
}

function setupDefaults(): void {
  mockedUseWalletInfo.mockReturnValue({ account: ACCOUNT_ADDRESS } as unknown as WalletInfo)
  mockedUseWalletProvider.mockReturnValue(mockProvider as unknown as ReturnType<typeof useWalletProvider>)
  mockedUseAppData.mockReturnValue({ doc: { appCode: 'CoW Swap' } } as unknown as ReturnType<typeof useAppData>)
  mockedUseDerivedTradeState.mockReturnValue({
    inputCurrency: mockInputCurrency,
    outputCurrency: mockOutputCurrency,
    orderKind: OrderKind.SELL,
  } as unknown as TradeDerivedState)
  mockedUseIsWrapOrUnwrap.mockReturnValue(false)
  mockedUseTradeSlippage.mockReturnValue({ type: 'default', value: 50 })
  mockedUseVolumeFee.mockReturnValue(undefined)
  mockedUseIsProviderNetworkUnsupported.mockReturnValue(false)
  mockedUseIsProviderNetworkDeprecated.mockReturnValue(false)
  mockedUseQuoteParamsRecipient.mockReturnValue({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: undefined })
}

describe('useQuoteParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupDefaults()
  })

  describe('returns undefined (no quote should be fetched)', () => {
    it('should return undefined when isWrapOrUnwrap is true', () => {
      mockedUseIsWrapOrUnwrap.mockReturnValue(true)

      const { result } = renderHook(() => useQuoteParams('1000000000000000000'))

      expect(result.current).toBeUndefined()
    })

    it('should return undefined when provider network is unsupported', () => {
      mockedUseIsProviderNetworkUnsupported.mockReturnValue(true)

      const { result } = renderHook(() => useQuoteParams('1000000000000000000'))

      expect(result.current).toBeUndefined()
    })

    it('should return undefined when provider network is deprecated', () => {
      mockedUseIsProviderNetworkDeprecated.mockReturnValue(true)

      const { result } = renderHook(() => useQuoteParams('1000000000000000000'))

      expect(result.current).toBeUndefined()
    })

    it('should return undefined when inputCurrency is missing', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: null,
        outputCurrency: mockOutputCurrency,
        orderKind: OrderKind.SELL,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParams('1000000000000000000'))

      expect(result.current).toBeUndefined()
    })

    it('should return undefined when outputCurrency is missing', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: mockInputCurrency,
        outputCurrency: null,
        orderKind: OrderKind.SELL,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParams('1000000000000000000'))

      expect(result.current).toBeUndefined()
    })

    it('should return undefined when provider is missing', () => {
      mockedUseWalletProvider.mockReturnValue(null as unknown as ReturnType<typeof useWalletProvider>)

      const { result } = renderHook(() => useQuoteParams('1000000000000000000'))

      expect(result.current).toBeUndefined()
    })

    it('should return undefined when trade state is null', () => {
      mockedUseDerivedTradeState.mockReturnValue(null)

      const { result } = renderHook(() => useQuoteParams('1000000000000000000'))

      expect(result.current).toBeUndefined()
    })
  })

  describe('returns quoteParams: undefined when amount is missing', () => {
    it('should return quoteParams undefined with null amount', () => {
      const { result } = renderHook(() => useQuoteParams(null))

      expect(result.current).toBeDefined()
      expect(result.current!.quoteParams).toBeUndefined()
      expect(result.current!.inputCurrency).toBe(mockInputCurrency)
    })

    it('should return quoteParams undefined with empty string amount', () => {
      const { result } = renderHook(() => useQuoteParams(''))

      expect(result.current).toBeDefined()
      expect(result.current!.quoteParams).toBeUndefined()
    })
  })

  describe('builds correct quoteParams', () => {
    const AMOUNT = '1000000000000000000'

    it('should build basic quoteParams with connected wallet', () => {
      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      const qp = result.current!.quoteParams!
      expect(qp.kind).toBe(OrderKind.SELL)
      expect(qp.amount).toBe(BigInt(AMOUNT))
      expect(qp.owner).toBe(ACCOUNT_ADDRESS)
      expect(qp.account).toBe(ACCOUNT_ADDRESS)
      expect(qp.sellTokenChainId).toBe(SupportedChainId.MAINNET)
      expect(qp.sellTokenAddress).toBe(SELL_TOKEN)
      expect(qp.sellTokenDecimals).toBe(18)
      expect(qp.buyTokenAddress).toBe(BUY_TOKEN)
      expect(qp.buyTokenDecimals).toBe(6)
      expect(qp.receiver).toBe(ACCOUNT_ADDRESS)
      expect(qp.bridgeRecipient).toBeUndefined()
      expect(qp.partiallyFillable).toBe(false)
      expect(qp.signer).toBe('user-signer')
    })

    it('should use BRIDGE_QUOTE_ACCOUNT and bridgeQuoteSigner when wallet is not connected', () => {
      mockedUseWalletInfo.mockReturnValue({ account: undefined } as unknown as WalletInfo)

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      const qp = result.current!.quoteParams!
      expect(qp.owner).toBe(BRIDGE_QUOTE_ACCOUNT)
      expect(qp.account).toBe(BRIDGE_QUOTE_ACCOUNT)
      expect(qp.signer).toBe('mock-signer')
    })

    it('should set partiallyFillable when passed', () => {
      const { result } = renderHook(() => useQuoteParams(AMOUNT, true))

      expect(result.current!.quoteParams!.partiallyFillable).toBe(true)
    })

    it('should include bridgeRecipient when set', () => {
      mockedUseQuoteParamsRecipient.mockReturnValue({
        receiver: ACCOUNT_ADDRESS,
        bridgeRecipient: SOLANA_ADDRESS,
      })

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      const qp = result.current!.quoteParams!
      expect(qp.receiver).toBe(ACCOUNT_ADDRESS)
      expect(qp.bridgeRecipient).toBe(SOLANA_ADDRESS)
    })

    it('should not include bridgeRecipient when undefined', () => {
      mockedUseQuoteParamsRecipient.mockReturnValue({
        receiver: ACCOUNT_ADDRESS,
        bridgeRecipient: undefined,
      })

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      expect(result.current!.quoteParams!).not.toHaveProperty('bridgeRecipient')
    })

    it('should include partnerFee when volumeFee is set', () => {
      const volumeFee = { volumeBps: 50, recipient: '0xfee' }
      mockedUseVolumeFee.mockReturnValue(volumeFee)

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      expect(result.current!.quoteParams!.partnerFee).toEqual(volumeFee)
    })

    it('should not include partnerFee when volumeFee is undefined', () => {
      mockedUseVolumeFee.mockReturnValue(undefined)

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      expect(result.current!.quoteParams!.partnerFee).toBeUndefined()
    })

    it('should include swapSlippageBps when slippage type is user', () => {
      mockedUseTradeSlippage.mockReturnValue({ type: 'user', value: 100 })

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      expect(result.current!.quoteParams!.swapSlippageBps).toBe(100)
    })

    it('should not include swapSlippageBps when slippage type is smart', () => {
      mockedUseTradeSlippage.mockReturnValue({ type: 'smart', value: 75 })

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      expect(result.current!.quoteParams!.swapSlippageBps).toBeUndefined()
    })

    it('should not include swapSlippageBps when slippage type is default', () => {
      mockedUseTradeSlippage.mockReturnValue({ type: 'default', value: 50 })

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      expect(result.current!.quoteParams!.swapSlippageBps).toBeUndefined()
    })
  })

  describe('hasSmartSlippage', () => {
    const AMOUNT = '1000000000000000000'

    it('should set hasSmartSlippage to true when smart slippage is set', () => {
      mockedUseTradeSlippage.mockReturnValue({ type: 'smart', value: 75 })

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      expect(result.current!.hasSmartSlippage).toBe(true)
    })

    it('should set hasSmartSlippage to false when slippage is user type', () => {
      mockedUseTradeSlippage.mockReturnValue({ type: 'user', value: 100 })

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      expect(result.current!.hasSmartSlippage).toBe(false)
    })

    it('should set hasSmartSlippage to false when slippage is default type', () => {
      mockedUseTradeSlippage.mockReturnValue({ type: 'default', value: 50 })

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      expect(result.current!.hasSmartSlippage).toBe(false)
    })
  })

  describe('cross-chain bridging params', () => {
    const AMOUNT = '1000000000000000000'

    it('should set different buy/sell chain IDs for cross-chain', () => {
      const crossChainOutput = {
        ...mockOutputCurrency,
        chainId: 42161, // Arbitrum
      }

      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: mockInputCurrency,
        outputCurrency: crossChainOutput,
        orderKind: OrderKind.SELL,
      } as unknown as TradeDerivedState)

      mockedUseQuoteParamsRecipient.mockReturnValue({
        receiver: ACCOUNT_ADDRESS,
        bridgeRecipient: SOLANA_ADDRESS,
      })

      const { result } = renderHook(() => useQuoteParams(AMOUNT))

      const qp = result.current!.quoteParams!
      expect(qp.sellTokenChainId).toBe(SupportedChainId.MAINNET)
      expect(qp.buyTokenChainId).toBe(42161)
      expect(qp.bridgeRecipient).toBe(SOLANA_ADDRESS)
    })
  })

  describe('appData', () => {
    it('should use appCode from appData when available', () => {
      mockedUseAppData.mockReturnValue({ doc: { appCode: 'MyApp' } } as unknown as ReturnType<typeof useAppData>)

      const { result } = renderHook(() => useQuoteParams('1000'))

      expect(result.current!.quoteParams!.appCode).toBe('MyApp')
      expect(result.current!.appData).toEqual({ appCode: 'MyApp' })
    })

    it('should fall back to DEFAULT_APP_CODE when appCode is not in appData', () => {
      mockedUseAppData.mockReturnValue({ doc: {} } as unknown as ReturnType<typeof useAppData>)

      const { result } = renderHook(() => useQuoteParams('1000'))

      expect(result.current!.quoteParams!.appCode).toBe('CoW Swap')
    })

    it('should fall back to DEFAULT_APP_CODE when appData doc is null', () => {
      mockedUseAppData.mockReturnValue({ doc: null } as unknown as ReturnType<typeof useAppData>)

      const { result } = renderHook(() => useQuoteParams('1000'))

      expect(result.current!.quoteParams!.appCode).toBe('CoW Swap')
    })
  })
})
