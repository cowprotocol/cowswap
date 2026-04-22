import { useCowAnalytics, type CowAnalytics } from '@cowprotocol/analytics'

import { renderHook } from '@testing-library/react'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { AffiliateModalState, AffiliatePageState } from './affiliateAnalytics.types'
import {
  getAffiliateModalViewKey,
  getAffiliatePartnerPageState,
  getAffiliateTraderModalState,
  getAffiliateTraderPageState,
  trackAffiliateEvent,
} from './affiliateAnalytics.utils'

import { useAffiliateStateViewAnalytics } from '../hooks/useAffiliateStateViewAnalytics'
import { logAffiliate } from '../utils/logger'

import type { TraderWalletStatus as TraderWalletStatusType } from '../hooks/useAffiliateTraderWallet'

const TraderWalletStatus = {
  PENDING: 'pending' as TraderWalletStatusType,
  UNSUPPORTED: 'unsupported' as TraderWalletStatusType,
  INELIGIBLE: 'ineligible' as TraderWalletStatusType,
  ELIGIBLE: 'eligible' as TraderWalletStatusType,
  LINKED: 'linked' as TraderWalletStatusType,
  ELIGIBILITY_UNKNOWN: 'eligibility-unknown' as TraderWalletStatusType,
  DISCONNECTED: 'disconnected' as TraderWalletStatusType,
} as const

jest.mock('@cowprotocol/analytics', () => {
  const actualModule = jest.requireActual('@cowprotocol/analytics')

  return {
    ...actualModule,
    __resetGtmInstance: jest.fn(),
    useCowAnalytics: jest.fn(),
  }
})

jest.mock('../utils/logger', () => ({
  logAffiliate: jest.fn(),
}))

jest.mock('../hooks/useAffiliateTraderWallet', () => ({
  TraderWalletStatus,
}))

const useCowAnalyticsMock = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>
const logAffiliateMock = logAffiliate as jest.MockedFunction<typeof logAffiliate>

describe('trackAffiliateEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sends affiliate analytics payloads without undefined fields', () => {
    const sendEvent = jest.fn()
    const analytics = { sendEvent } as unknown as CowAnalytics

    trackAffiliateEvent({
      analytics,
      action: 'affiliate_trader_page_state_viewed',
      chainId: 1,
      walletStatus: TraderWalletStatus.LINKED,
      optionalField: undefined,
    })

    const payload = sendEvent.mock.calls[0]?.[0] as Record<string, unknown>

    expect(payload).toEqual({
      category: CowSwapAnalyticsCategory.AFFILIATE,
      action: 'affiliate_trader_page_state_viewed',
      chainId: 1,
      walletStatus: TraderWalletStatus.LINKED,
    })
    expect(Object.keys(payload)).toEqual(['category', 'action', 'chainId', 'walletStatus'])
    expect(Object.prototype.hasOwnProperty.call(payload, 'optionalField')).toBe(false)
  })

  it('swallows analytics transport failures', () => {
    const sendEvent = jest.fn(() => {
      throw new Error('analytics failed')
    })
    const analytics = { sendEvent } as unknown as CowAnalytics

    expect(() =>
      trackAffiliateEvent({
        analytics,
        action: 'affiliate_trader_page_state_viewed',
        walletStatus: TraderWalletStatus.LINKED,
      }),
    ).not.toThrow()

    expect(logAffiliateMock).toHaveBeenCalledWith('Failed to send analytics event', {
      action: 'affiliate_trader_page_state_viewed',
      error: expect.any(Error),
    })
  })
})

describe('getAffiliatePartnerPageState', () => {
  it('returns onboarding when the wallet or trading network is not eligible', () => {
    expect(
      getAffiliatePartnerPageState({
        hasAccount: false,
        hasExistingCode: false,
        isLoading: false,
        isSupportedPayoutNetwork: true,
        isSupportedTradingNetwork: true,
      }),
    ).toBe(AffiliatePageState.ONBOARD)
  })

  it('returns undefined while partner info is loading', () => {
    expect(
      getAffiliatePartnerPageState({
        hasAccount: true,
        hasExistingCode: false,
        isLoading: true,
        isSupportedPayoutNetwork: true,
        isSupportedTradingNetwork: true,
      }),
    ).toBeUndefined()
  })

  it('keeps existing partners on the live page state on unsupported payout networks', () => {
    expect(
      getAffiliatePartnerPageState({
        hasAccount: true,
        hasExistingCode: true,
        isLoading: false,
        isSupportedPayoutNetwork: false,
        isSupportedTradingNetwork: true,
      }),
    ).toBe(AffiliatePageState.CODE_LIVE)
  })
})

describe('trader analytics helpers', () => {
  it('derives trader page and modal states from wallet status', () => {
    expect(getAffiliateTraderPageState(TraderWalletStatus.PENDING, false)).toBe(AffiliatePageState.LOADING)
    expect(getAffiliateTraderPageState(TraderWalletStatus.UNSUPPORTED, true)).toBe(AffiliatePageState.UNSUPPORTED)
    expect(getAffiliateTraderPageState(TraderWalletStatus.INELIGIBLE, true)).toBe(AffiliatePageState.INELIGIBLE)
    expect(getAffiliateTraderPageState(TraderWalletStatus.ELIGIBLE, true)).toBe(AffiliatePageState.LINKED)
    expect(getAffiliateTraderPageState(TraderWalletStatus.ELIGIBILITY_UNKNOWN, false)).toBe(AffiliatePageState.ONBOARD)
    expect(getAffiliateTraderModalState(TraderWalletStatus.INELIGIBLE)).toBe(AffiliateModalState.INELIGIBLE)
  })

  it('builds stable modal analytics keys only while the modal is open', () => {
    expect(getAffiliateModalViewKey(true, AffiliateModalState.CODE_LINKING, TraderWalletStatus.ELIGIBLE)).toBe(
      'codeLinking:eligible',
    )

    expect(getAffiliateModalViewKey(false, AffiliateModalState.LINKED, TraderWalletStatus.LINKED)).toBeUndefined()
  })
})

describe('useAffiliateStateViewAnalytics', () => {
  const sendEvent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useCowAnalyticsMock.mockReturnValue({
      sendEvent,
    } as unknown as ReturnType<typeof useCowAnalytics>)
  })

  it('re-tracks the view when payload fields change for the same view key', () => {
    const { rerender } = renderHook(
      ({ walletStatus }: { walletStatus: TraderWalletStatusType }) =>
        useAffiliateStateViewAnalytics({
          action: 'affiliate_trader_page_state_viewed',
          viewKey: AffiliatePageState.LINKED,
          eventParams: {
            pageState: AffiliatePageState.LINKED,
            walletStatus,
            hasSavedCode: true,
          },
        }),
      {
        initialProps: {
          walletStatus: TraderWalletStatus.ELIGIBLE,
        },
      },
    )

    expect(sendEvent).toHaveBeenCalledTimes(1)

    rerender({
      walletStatus: TraderWalletStatus.LINKED,
    })

    expect(sendEvent).toHaveBeenCalledTimes(2)
    expect(sendEvent).toHaveBeenLastCalledWith({
      category: CowSwapAnalyticsCategory.AFFILIATE,
      action: 'affiliate_trader_page_state_viewed',
      pageState: AffiliatePageState.LINKED,
      walletStatus: TraderWalletStatus.LINKED,
      hasSavedCode: true,
    })
  })

  it('ignores reserved analytics keys from event params', () => {
    const rogueAnalytics = { sendEvent: jest.fn() } as unknown as CowAnalytics

    renderHook(() =>
      useAffiliateStateViewAnalytics({
        action: 'affiliate_trader_page_state_viewed',
        viewKey: AffiliatePageState.LINKED,
        eventParams: {
          pageState: AffiliatePageState.LINKED,
          ...({
            action: 'affiliate_partner_page_state_viewed',
            analytics: rogueAnalytics,
          } as unknown as Record<string, unknown> & { action?: never; analytics?: never }),
        },
      }),
    )

    expect(sendEvent).toHaveBeenCalledTimes(1)
    expect(sendEvent).toHaveBeenCalledWith({
      category: CowSwapAnalyticsCategory.AFFILIATE,
      action: 'affiliate_trader_page_state_viewed',
      pageState: AffiliatePageState.LINKED,
    })
    expect(rogueAnalytics.sendEvent).not.toHaveBeenCalled()
  })
})
