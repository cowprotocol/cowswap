import { useAtomValue } from 'jotai'

import { EnrichedOrder, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useTwapPartOrdersCache } from './useTwapPartOrdersCache'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

const useAtomValueMock = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

const ACCOUNT = '0x1111111111111111111111111111111111111111'

function createTestOrder(uid: string): EnrichedOrder {
  return { uid } as EnrichedOrder
}

describe('useTwapPartOrdersCache', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses getAddressKey(account) when resolving scoped cache', () => {
    // arrange
    const scopeKey = `${SupportedChainId.MAINNET}:${getAddressKey(ACCOUNT)}`
    const cacheByUid = {
      order_part_1: { twapOrderId: 'twap-1', enrichedOrder: createTestOrder('order_part_1') },
    }

    useWalletInfoMock.mockReturnValue({
      chainId: SupportedChainId.MAINNET,
      account: ACCOUNT,
    })
    useAtomValueMock.mockReturnValue({
      [scopeKey]: cacheByUid,
    })

    // act
    const { result } = renderHook(useTwapPartOrdersCache)

    // assert
    expect(result.current.cacheByUid).toEqual(cacheByUid)
  })

  it('returns deduplicated finalized twap order IDs', () => {
    // arrange
    const scopeKey = `${SupportedChainId.MAINNET}:${getAddressKey(ACCOUNT)}`
    const cacheByUid = {
      order_part_1: { twapOrderId: 'twap-1', enrichedOrder: createTestOrder('order_part_1') },
      order_part_2: { twapOrderId: 'twap-1', enrichedOrder: createTestOrder('order_part_2') },
    }

    useWalletInfoMock.mockReturnValue({
      chainId: SupportedChainId.MAINNET,
      account: ACCOUNT,
    })
    useAtomValueMock.mockReturnValue({
      [scopeKey]: cacheByUid,
    })

    // act
    const { result } = renderHook(useTwapPartOrdersCache)

    // assert
    expect([...result.current.cachedFinalizedTwapOrderIds]).toEqual(['twap-1'])
  })

  it('memoizes the returned object identity when inputs do not change', () => {
    // arrange
    const scopeKey = `${SupportedChainId.MAINNET}:${getAddressKey(ACCOUNT)}`
    const cacheByUid = {
      order_part_1: { twapOrderId: 'twap-1', enrichedOrder: createTestOrder('order_part_1') },
    }

    useWalletInfoMock.mockReturnValue({
      chainId: SupportedChainId.MAINNET,
      account: ACCOUNT,
    })
    useAtomValueMock.mockReturnValue({
      [scopeKey]: cacheByUid,
    })

    // act
    const { result, rerender } = renderHook(useTwapPartOrdersCache)

    const firstResult = result.current

    rerender()

    // assert
    expect(result.current).toBe(firstResult)
  })
})
