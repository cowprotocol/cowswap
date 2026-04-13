import { useAtomValue } from 'jotai'

import { useMachineTimeMs } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useAffiliateTraderStats } from './useAffiliateTraderStats'
import { useIsRefCodeExpired } from './useIsRefCodeExpired'

import { AFFILIATE_EXPIRY_CHECK_INTERVAL_MS } from '../config/affiliateProgram.const'
import { logAffiliate } from '../utils/logger'

import type { TraderStatsResponse } from '../api/bffAffiliateApi.types'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('@cowprotocol/common-hooks', () => {
  const actualModule = jest.requireActual('@cowprotocol/common-hooks')

  return {
    ...actualModule,
    useMachineTimeMs: jest.fn(),
  }
})

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('./useAffiliateTraderStats', () => ({
  useAffiliateTraderStats: jest.fn(),
}))

jest.mock('../utils/logger', () => ({
  logAffiliate: jest.fn(),
}))

const useAtomValueMock = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const useMachineTimeMsMock = useMachineTimeMs as jest.MockedFunction<typeof useMachineTimeMs>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useAffiliateTraderStatsMock = useAffiliateTraderStats as jest.MockedFunction<typeof useAffiliateTraderStats>
const logAffiliateMock = logAffiliate as jest.MockedFunction<typeof logAffiliate>

function createTraderStatsResponse(rewardsEnd: string): TraderStatsResponse {
  return {
    trader_address: '0x1111111111111111111111111111111111111111',
    bound_referrer_code: 'COW-123',
    linked_since: '2026-04-01T00:00:00.000Z',
    rewards_end: rewardsEnd,
    eligible_volume: 0,
    left_to_next_rewards: 0,
    trigger_volume: 0,
    total_earned: 0,
    paid_out: 0,
    next_payout: 0,
    lastUpdatedAt: '2026-04-01T00:00:00.000Z',
  }
}

describe('useIsRefCodeExpired', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useWalletInfoMock.mockReturnValue({
      account: '0x1111111111111111111111111111111111111111',
      chainId: 1,
    })
    useAtomValueMock.mockReturnValue({
      savedCode: 'COW-123',
    })
  })

  it('returns false while expiry is unknown', () => {
    useAffiliateTraderStatsMock.mockReturnValue({
      data: null,
    } as ReturnType<typeof useAffiliateTraderStats>)
    useMachineTimeMsMock.mockReturnValue(Date.parse('2026-04-10T00:00:00.000Z'))

    const { result } = renderHook(() => useIsRefCodeExpired())

    expect(useAffiliateTraderStatsMock).toHaveBeenCalledWith('0x1111111111111111111111111111111111111111', true)
    expect(useMachineTimeMsMock).toHaveBeenCalledWith(AFFILIATE_EXPIRY_CHECK_INTERVAL_MS)
    expect(result.current).toBe(false)
    expect(logAffiliateMock).not.toHaveBeenCalled()
  })

  it('still reports expired codes when tracking is enabled', () => {
    useAffiliateTraderStatsMock.mockReturnValue({
      data: createTraderStatsResponse('2026-04-01T00:00:00.000Z'),
    } as ReturnType<typeof useAffiliateTraderStats>)
    useMachineTimeMsMock.mockReturnValue(Date.parse('2026-04-10T00:00:00.000Z'))

    const { result } = renderHook(() => useIsRefCodeExpired())

    expect(useAffiliateTraderStatsMock).toHaveBeenCalledWith('0x1111111111111111111111111111111111111111', true)
    expect(useMachineTimeMsMock).toHaveBeenCalledWith(AFFILIATE_EXPIRY_CHECK_INTERVAL_MS)
    expect(result.current).toBe(true)
  })
})
