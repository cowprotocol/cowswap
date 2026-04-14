import { useCowAnalytics, type CowAnalytics } from '@cowprotocol/analytics'

import { renderHook } from '@testing-library/react'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import {
  AffiliateCodeSource,
  AffiliateEntrySource,
  AffiliateModalState,
  AffiliatePageState,
} from './affiliateAnalytics.types'
import {
  getAffiliateCodeSourceFallback,
  getAffiliateModalOpenViewKey,
  getAffiliateModalViewKey,
  getAffiliatePartnerPageState,
  getAffiliateTraderModalState,
  getAffiliateTraderPageState,
  trackAffiliateEvent,
} from './affiliateAnalytics.utils'

import { useAffiliateStateViewAnalytics } from '../hooks/useAffiliateStateViewAnalytics'
import { TraderWalletStatus } from '../hooks/useAffiliateTraderWallet'
import { logAffiliate } from '../utils/logger'

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
      codeSource: undefined,
    })

    expect(sendEvent).toHaveBeenCalledWith({
      category: CowSwapAnalyticsCategory.AFFILIATE,
      action: 'affiliate_trader_page_state_viewed',
      chainId: 1,
      walletStatus: TraderWalletStatus.LINKED,
    })
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
  it('returns onboard when the wallet or network is not eligible for partner setup', () => {
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

  it('returns undefined while partner info is still loading', () => {
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

  it('returns the live and creation states once loading completes', () => {
    expect(
      getAffiliatePartnerPageState({
        hasAccount: true,
        hasExistingCode: true,
        isLoading: false,
        isSupportedPayoutNetwork: true,
        isSupportedTradingNetwork: true,
      }),
    ).toBe(AffiliatePageState.CODE_LIVE)

    expect(
      getAffiliatePartnerPageState({
        hasAccount: true,
        hasExistingCode: false,
        isLoading: false,
        isSupportedPayoutNetwork: true,
        isSupportedTradingNetwork: true,
      }),
    ).toBe(AffiliatePageState.CODE_CREATION)
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
    expect(getAffiliateTraderPageState(TraderWalletStatus.UNSUPPORTED, false)).toBe(AffiliatePageState.UNSUPPORTED)
    expect(getAffiliateTraderPageState(TraderWalletStatus.UNSUPPORTED, true)).toBe(AffiliatePageState.UNSUPPORTED)
    expect(getAffiliateTraderPageState(TraderWalletStatus.INELIGIBLE, true)).toBe(AffiliatePageState.INELIGIBLE)
    expect(getAffiliateTraderPageState(TraderWalletStatus.ELIGIBLE, true)).toBe(AffiliatePageState.LINKED)
    expect(getAffiliateTraderPageState(TraderWalletStatus.ELIGIBILITY_UNKNOWN, false)).toBe(AffiliatePageState.ONBOARD)
    expect(getAffiliateTraderModalState(TraderWalletStatus.INELIGIBLE)).toBe(AffiliateModalState.INELIGIBLE)
  })

  it('builds stable modal analytics keys only while the modal is open', () => {
    expect(
      getAffiliateModalViewKey(
        true,
        AffiliateModalState.CODE_LINKING,
        TraderWalletStatus.ELIGIBLE,
        AffiliateEntrySource.TRADER_PAGE_ONBOARD,
      ),
    ).toBe('codeLinking:eligible:traderPageOnboard')

    expect(
      getAffiliateModalOpenViewKey(
        true,
        TraderWalletStatus.LINKED,
        AffiliateEntrySource.TRADER_REWARDS_ROW,
        true,
        true,
      ),
    ).toBe('linked:traderRewardsRow:true:true')

    expect(
      getAffiliateModalViewKey(false, AffiliateModalState.LINKED, TraderWalletStatus.LINKED, undefined),
    ).toBeUndefined()
  })

  it('falls back to legacy or manual code sources based on linkage state', () => {
    expect(getAffiliateCodeSourceFallback(true)).toBe(AffiliateCodeSource.LEGACY_UNKNOWN)
    expect(getAffiliateCodeSourceFallback(false)).toBe(AffiliateCodeSource.MANUAL_INPUT)
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
      ({ walletStatus }) =>
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

    rerender({
      walletStatus: TraderWalletStatus.LINKED,
    })

    expect(sendEvent).toHaveBeenCalledTimes(2)
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
