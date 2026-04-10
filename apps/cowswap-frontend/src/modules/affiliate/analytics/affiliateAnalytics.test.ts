import type { CowAnalytics } from '@cowprotocol/analytics'

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

import { TraderWalletStatus } from '../hooks/useAffiliateTraderWallet'

describe('trackAffiliateEvent', () => {
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
})

describe('trader analytics helpers', () => {
  it('derives trader page and modal states from wallet status', () => {
    expect(getAffiliateTraderPageState(TraderWalletStatus.PENDING, false)).toBe(AffiliatePageState.LOADING)
    expect(getAffiliateTraderPageState(TraderWalletStatus.UNSUPPORTED, false)).toBe(AffiliatePageState.UNSUPPORTED)
    expect(getAffiliateTraderPageState(TraderWalletStatus.ELIGIBLE, true)).toBe(AffiliatePageState.LINKED)
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
