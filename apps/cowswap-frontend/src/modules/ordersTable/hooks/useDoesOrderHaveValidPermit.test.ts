import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Erc20__factory } from '@cowprotocol/cowswap-abis'
import { oneInchPermitUtilsConsts } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'

import { renderHook } from '@testing-library/react'
import useSWR from 'swr'
import { usePublicClient } from 'wagmi'

import { Order } from 'legacy/state/orders/actions'

import { usePermitInfo } from 'modules/permit'
import { TradeType } from 'modules/trade'

import { isPending } from 'common/hooks/useCategorizeRecentActivity'
import { getOrderPermitIfExists } from 'common/utils/doesOrderHavePermit'

import { useDoesOrderHaveValidPermit } from './useDoesOrderHaveValidPermit'

// Mock SWR response interface
interface MockSWRResponse {
  data: boolean | undefined
  error: Error | undefined
  mutate: jest.MockedFunction<() => Promise<boolean | undefined>>
  isValidating: boolean
  isLoading: boolean
}

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('@cowprotocol/wallet-provider', () => ({
  useWalletProvider: jest.fn(),
}))

jest.mock('wagmi', () => ({
  useConfig: jest.fn().mockReturnValue({}),
  usePublicClient: jest.fn().mockReturnValue({}),
}))

jest.mock('modules/permit', () => ({
  usePermitInfo: jest.fn(),
}))

jest.mock('common/hooks/useCategorizeRecentActivity', () => ({
  isPending: jest.fn(),
}))

jest.mock('common/utils/doesOrderHavePermit', () => ({
  getOrderPermitIfExists: jest.fn(),
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../utils/checkPermitNonceAndAmount', () => ({
  checkPermitNonceAndAmount: jest.fn(),
}))

const erc20Interface = Erc20__factory.createInterface()

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUsePublicClient = usePublicClient as jest.MockedFunction<typeof usePublicClient>
const mockUsePermitInfo = usePermitInfo as jest.MockedFunction<typeof usePermitInfo>
const mockIsPending = isPending as jest.MockedFunction<typeof isPending>
const mockGetOrderPermitIfExists = getOrderPermitIfExists as jest.MockedFunction<typeof getOrderPermitIfExists>
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

function createEip2612PermitCallData(owner: string, spender: string, value: EthersBigNumber, deadline: number): string {
  const permitData = erc20Interface.encodeFunctionData('permit', [
    owner,
    spender,
    value,
    deadline,
    0, // v
    '0x0000000000000000000000000000000000000000000000000000000000000000', // r
    '0x0000000000000000000000000000000000000000000000000000000000000000', // s
  ])
  // Replace standard permit selector (first 10 chars: 0x + 4 bytes) with EIP_2612_PERMIT_SELECTOR
  return oneInchPermitUtilsConsts.EIP_2612_PERMIT_SELECTOR + permitData.slice(10)
}

describe('useDoesOrderHaveValidPermit', () => {
  const mockAccount = '0x1234567890123456789012345678901234567890'
  const mockChainId = SupportedChainId.MAINNET
  const mockOrder = {
    id: 'test-order-id',
    sellToken: '0x1234567890123456789012345678901234567890',
    sellAmount: '1000000000000000000',
    inputToken: {
      name: 'Test Token',
      symbol: 'TEST',
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      decimals: 18,
      isNative: false,
      isToken: true,
    },
  } as Order
  const spenderAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[mockChainId]
  const futureDeadline = Math.floor(Date.now() / 1000) + 86400 // 24 hours from now
  const permitValue = EthersBigNumber.from('1000000000000000000') // 1 token
  const mockPermit = createEip2612PermitCallData(mockAccount, spenderAddress, permitValue, futureDeadline)
  const mockPermitInfo = { type: 'eip-2612' as const }

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    mockUseWalletInfo.mockReturnValue({ account: mockAccount, chainId: mockChainId })
    mockUsePermitInfo.mockReturnValue(mockPermitInfo)
    mockIsPending.mockReturnValue(true)
    mockGetOrderPermitIfExists.mockReturnValue(mockPermit)
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn().mockResolvedValue(undefined),
      isValidating: false,
      isLoading: false,
    } as MockSWRResponse)
  })

  describe('when order is not provided', () => {
    it('should return undefined', () => {
      const { result } = renderHook(() => useDoesOrderHaveValidPermit(undefined, TradeType.SWAP))

      expect(result.current).toBeUndefined()
      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
    })
  })

  describe('when account is not available', () => {
    it('should return undefined', () => {
      mockUseWalletInfo.mockReturnValue({ account: undefined, chainId: mockChainId })

      const { result } = renderHook(() => useDoesOrderHaveValidPermit(mockOrder, TradeType.SWAP))

      expect(result.current).toBeUndefined()
      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
    })
  })

  describe('when public client is not available', () => {
    it('should return undefined', () => {
      mockUsePublicClient.mockReturnValueOnce(undefined)

      const { result } = renderHook(() => useDoesOrderHaveValidPermit(mockOrder, TradeType.SWAP))

      expect(result.current).toBeUndefined()
      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
    })
  })

  describe('when permit is not available', () => {
    it('should return undefined', () => {
      mockGetOrderPermitIfExists.mockReturnValue(null)

      const { result } = renderHook(() => useDoesOrderHaveValidPermit(mockOrder, TradeType.SWAP))

      expect(result.current).toBeUndefined()
      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
    })
  })

  describe('when order is not pending', () => {
    it('should return undefined', () => {
      mockIsPending.mockReturnValue(false)

      const { result } = renderHook(() => useDoesOrderHaveValidPermit(mockOrder, TradeType.SWAP))

      expect(result.current).toBeUndefined()
      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
    })
  })

  describe('when trade type is not provided', () => {
    it('should return undefined', () => {
      const { result } = renderHook(() => useDoesOrderHaveValidPermit(mockOrder, undefined))

      expect(result.current).toBeUndefined()
      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
    })
  })

  describe('when all conditions are met', () => {
    it('should call SWR with correct parameters', () => {
      const { result: _result } = renderHook(() => useDoesOrderHaveValidPermit(mockOrder, TradeType.SWAP))

      expect(mockUseSWR).toHaveBeenCalledWith(
        [mockAccount, mockChainId, mockOrder.id, TradeType.SWAP, mockPermit],
        expect.any(Function),
        expect.objectContaining({
          refreshInterval: expect.any(Number),
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          errorRetryInterval: 0,
        }),
      )
    })

    it('should return SWR data when available', () => {
      mockUseSWR.mockReturnValue({
        data: true,
        error: undefined,
        mutate: jest.fn().mockResolvedValue(undefined),
        isValidating: false,
        isLoading: false,
      } as MockSWRResponse)

      const { result } = renderHook(() => useDoesOrderHaveValidPermit(mockOrder, TradeType.SWAP))

      expect(result.current).toBe(true)
    })

    it('should return undefined when SWR data is undefined', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: jest.fn().mockResolvedValue(undefined),
        isValidating: false,
        isLoading: false,
      } as MockSWRResponse)

      const { result } = renderHook(() => useDoesOrderHaveValidPermit(mockOrder, TradeType.SWAP))

      expect(result.current).toBeUndefined()
    })
  })

  describe('SWR configuration', () => {
    it('should use correct SWR configuration', () => {
      renderHook(() => useDoesOrderHaveValidPermit(mockOrder, TradeType.SWAP))

      expect(mockUseSWR).toHaveBeenCalledWith(
        [mockAccount, mockChainId, mockOrder.id, TradeType.SWAP, mockPermit],
        expect.any(Function),
        expect.objectContaining({
          refreshInterval: expect.any(Number),
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          errorRetryInterval: 0,
        }),
      )
    })
  })

  describe('different trade types', () => {
    it('should work with LIMIT_ORDER trade type', () => {
      const { result: _result } = renderHook(() => useDoesOrderHaveValidPermit(mockOrder, TradeType.LIMIT_ORDER))

      expect(mockUseSWR).toHaveBeenCalledWith(
        [mockAccount, mockChainId, mockOrder.id, TradeType.LIMIT_ORDER, mockPermit],
        expect.any(Function),
        expect.any(Object),
      )
    })

    it('should work with ADVANCED_ORDERS trade type', () => {
      const { result: _result } = renderHook(() => useDoesOrderHaveValidPermit(mockOrder, TradeType.ADVANCED_ORDERS))

      expect(mockUseSWR).toHaveBeenCalledWith(
        [mockAccount, mockChainId, mockOrder.id, TradeType.ADVANCED_ORDERS, mockPermit],
        expect.any(Function),
        expect.any(Object),
      )
    })
  })
})
