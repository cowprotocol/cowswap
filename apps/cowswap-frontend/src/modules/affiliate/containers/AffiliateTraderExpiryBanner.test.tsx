import { type ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { useMachineTimeMs, useTimeAgo } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { render, screen } from '@testing-library/react'

import { AffiliateTraderExpiryBanner } from './AffiliateTraderExpiryBanner'

import { useAffiliateStateViewAnalytics } from '../hooks/useAffiliateStateViewAnalytics'
import { useAffiliateTraderStats } from '../hooks/useAffiliateTraderStats'

import type { TraderStatsResponse } from '../api/bffAffiliateApi.types'

jest.mock('@cowprotocol/common-hooks', () => {
  const actualModule = jest.requireActual('@cowprotocol/common-hooks')

  return {
    ...actualModule,
    useMachineTimeMs: jest.fn(),
    useTimeAgo: jest.fn(),
  }
})

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('@cowprotocol/ui', () => ({
  BannerOrientation: {
    Horizontal: 'horizontal',
  },
  InlineBanner: ({ children }: { children: ReactNode }) => children,
  StatusColorVariant: {
    Alert: 'alert',
  },
}))

jest.mock('../hooks/useAffiliateTraderStats', () => ({
  useAffiliateTraderStats: jest.fn(),
}))

jest.mock('../hooks/useAffiliateStateViewAnalytics', () => ({
  useAffiliateStateViewAnalytics: jest.fn(),
}))

jest.mock('../lib/affiliateProgramUtils', () => ({
  toValidDate: (value?: string) => (value ? new Date(value) : undefined),
}))

const useMachineTimeMsMock = useMachineTimeMs as jest.MockedFunction<typeof useMachineTimeMs>
const useTimeAgoMock = useTimeAgo as jest.MockedFunction<typeof useTimeAgo>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useAffiliateTraderStatsMock = useAffiliateTraderStats as jest.MockedFunction<typeof useAffiliateTraderStats>
const useAffiliateStateViewAnalyticsMock = useAffiliateStateViewAnalytics as jest.MockedFunction<
  typeof useAffiliateStateViewAnalytics
>

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

function renderComponent(): void {
  render(
    <I18nProvider i18n={i18n}>
      <AffiliateTraderExpiryBanner />
    </I18nProvider>,
  )
}

i18n.load('en-US', {})
i18n.activate('en-US')

describe('AffiliateTraderExpiryBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useWalletInfoMock.mockReturnValue({
      account: '0x1111111111111111111111111111111111111111',
      chainId: 1,
    })
    useTimeAgoMock.mockReturnValue('1 day ago')
  })

  it('tracks the expired-code event when the banner shows an expired code', () => {
    useAffiliateTraderStatsMock.mockReturnValue({
      data: createTraderStatsResponse('2026-04-01T00:00:00.000Z'),
      isLoading: false,
    } as ReturnType<typeof useAffiliateTraderStats>)
    useMachineTimeMsMock.mockReturnValue(Date.parse('2026-04-10T00:00:00.000Z'))

    renderComponent()

    expect(useAffiliateStateViewAnalyticsMock).toHaveBeenCalledWith({
      action: 'affiliate_trader_expired_code_viewed',
      viewKey: '2026-04-01T00:00:00.000Z',
      eventParams: {
        rewardsEnd: '2026-04-01T00:00:00.000Z',
      },
    })

    expect(screen.getByText('Your referral code expired on Apr 01, 2026.')).toBeTruthy()
  })

  it('does not track the expired-code event for a non-expired banner state', () => {
    useAffiliateTraderStatsMock.mockReturnValue({
      data: createTraderStatsResponse('2026-04-11T00:00:00.000Z'),
      isLoading: false,
    } as ReturnType<typeof useAffiliateTraderStats>)
    useMachineTimeMsMock.mockReturnValue(Date.parse('2026-04-10T12:00:00.000Z'))

    renderComponent()

    expect(useAffiliateStateViewAnalyticsMock).toHaveBeenCalledWith({
      action: 'affiliate_trader_expired_code_viewed',
      viewKey: undefined,
      eventParams: undefined,
    })
  })

  it('treats the exact expiry boundary as expired', () => {
    const rewardsEnd = '2026-04-10T12:00:00.000Z'

    useAffiliateTraderStatsMock.mockReturnValue({
      data: createTraderStatsResponse(rewardsEnd),
      isLoading: false,
    } as ReturnType<typeof useAffiliateTraderStats>)
    useMachineTimeMsMock.mockReturnValue(Date.parse(rewardsEnd))

    renderComponent()

    expect(useAffiliateStateViewAnalyticsMock).toHaveBeenCalledWith({
      action: 'affiliate_trader_expired_code_viewed',
      viewKey: rewardsEnd,
      eventParams: {
        rewardsEnd,
      },
    })
    expect(screen.getByText('Your referral code expired on Apr 10, 2026.')).toBeTruthy()
  })
})
