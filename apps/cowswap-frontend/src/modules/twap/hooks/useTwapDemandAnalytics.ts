import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import {
  useAccountType,
  useIsSafeViaWc,
  useIsSafeWallet,
  useIsSmartContractWallet,
  useWalletInfo,
} from '@cowprotocol/wallet'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import {
  TwapDemandAnalyticsEvent,
  TwapDemandAnalyticsParams,
  TwapDemandWalletType,
  TwapSellAmountUsdBucket,
} from '../analytics/twapDemandAnalytics.types'
import {
  getAndIncrementTwapUnsupportedWalletEncounterCountBucket,
  getIsTwapInterestRegistered,
  getIsTwapDemandWalletTypePending,
  getTwapDemandSessionStorageKey,
  getTwapDemandWalletType,
  markTwapDemandEventTrackedInSession,
  registerTwapInterest,
} from '../analytics/twapDemandAnalytics.utils'

interface UnsupportedWalletShownParams {
  hasFormInput: boolean
  sellAmountUsdBucket: TwapSellAmountUsdBucket
}

interface InterestClickParams {
  sellAmountUsdBucket: TwapSellAmountUsdBucket
}

interface TwapDemandAnalytics {
  isInterestRegistered: boolean
  isSafeViaWc: boolean
  trackInterestClick(params: InterestClickParams): void
  trackSafeWcBannerClick(): void
  trackSafeWcBannerShown(): void
  trackSetupLinkClick(): void
  trackTwapTabOpened(): void
  trackUnsupportedWalletShown(params: UnsupportedWalletShownParams): void
}

export function useTwapDemandAnalytics(): TwapDemandAnalytics {
  const cowAnalytics = useCowAnalytics()
  const { account } = useWalletInfo()
  const { isSafeViaWc, isWalletTypePending, walletType } = useTwapDemandWalletType(account)
  const trackOncePerSession = useTrackTwapDemandEventOncePerSession(account)
  const [isInterestRegistered, setIsInterestRegistered] = useState(() => getIsTwapInterestRegistered(account))

  useEffect(() => {
    setIsInterestRegistered(getIsTwapInterestRegistered(account))
  }, [account])

  const sendTwapEvent = useCallback(
    (action: TwapDemandAnalyticsEvent, params?: TwapDemandAnalyticsParams) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.TWAP,
        action,
        ...params,
      })
    },
    [cowAnalytics],
  )

  const trackUnsupportedWalletShown = useCallback(
    ({ hasFormInput, sellAmountUsdBucket }: UnsupportedWalletShownParams) => {
      if (isWalletTypePending) return

      trackOncePerSession(TwapDemandAnalyticsEvent.UNSUPPORTED_WALLET_SHOWN, () => {
        const encounterCountBucket = getAndIncrementTwapUnsupportedWalletEncounterCountBucket(account)

        sendTwapEvent(TwapDemandAnalyticsEvent.UNSUPPORTED_WALLET_SHOWN, {
          wallet_type: walletType,
          has_form_input: hasFormInput,
          sell_amount_usd_bucket: sellAmountUsdBucket,
          encounter_count_bucket: encounterCountBucket,
        })
      })
    },
    [account, isWalletTypePending, sendTwapEvent, trackOncePerSession, walletType],
  )

  const trackSetupLinkClick = useCallback(() => {
    sendTwapEvent(TwapDemandAnalyticsEvent.SETUP_LINK_CLICK, { wallet_type: walletType })
  }, [sendTwapEvent, walletType])

  const trackSafeWcBannerShown = useCallback(() => {
    if (isWalletTypePending) return

    trackOncePerSession(TwapDemandAnalyticsEvent.SAFE_WC_BANNER_SHOWN, () => {
      sendTwapEvent(TwapDemandAnalyticsEvent.SAFE_WC_BANNER_SHOWN, { wallet_type: walletType })
    })
  }, [isWalletTypePending, sendTwapEvent, trackOncePerSession, walletType])

  const trackSafeWcBannerClick = useCallback(() => {
    sendTwapEvent(TwapDemandAnalyticsEvent.SAFE_WC_BANNER_CLICK, { wallet_type: walletType })
  }, [sendTwapEvent, walletType])

  const trackInterestClick = useCallback(
    ({ sellAmountUsdBucket }: InterestClickParams) => {
      if (getIsTwapInterestRegistered(account)) {
        setIsInterestRegistered(true)
        return
      }

      registerTwapInterest(account)
      setIsInterestRegistered(true)

      sendTwapEvent(TwapDemandAnalyticsEvent.INTEREST_CLICK, {
        wallet_type: walletType,
        sell_amount_usd_bucket: sellAmountUsdBucket,
      })
    },
    [account, sendTwapEvent, walletType],
  )

  const trackTwapTabOpened = useCallback(() => {
    if (isWalletTypePending) return

    trackOncePerSession(TwapDemandAnalyticsEvent.TAB_OPENED, () => {
      sendTwapEvent(TwapDemandAnalyticsEvent.TAB_OPENED, { wallet_type: walletType })
    })
  }, [isWalletTypePending, sendTwapEvent, trackOncePerSession, walletType])

  return {
    isInterestRegistered,
    isSafeViaWc,
    trackInterestClick,
    trackSafeWcBannerClick,
    trackSafeWcBannerShown,
    trackSetupLinkClick,
    trackTwapTabOpened,
    trackUnsupportedWalletShown,
  }
}

function useTwapDemandWalletType(account?: string): {
  isSafeViaWc: boolean
  isWalletTypePending: boolean
  walletType: TwapDemandWalletType
} {
  const accountType = useAccountType()
  const isSafeViaWc = useIsSafeViaWc()
  const isSafeWallet = useIsSafeWallet()
  const isSmartContractWallet = useIsSmartContractWallet()

  const walletType = useMemo(() => {
    return getTwapDemandWalletType({
      account,
      accountType,
      isSafeViaWc,
      isSafeWallet,
      isSmartContractWallet,
    })
  }, [account, accountType, isSafeViaWc, isSafeWallet, isSmartContractWallet])

  const isWalletTypePending = useMemo(() => {
    return getIsTwapDemandWalletTypePending({
      account,
      accountType,
      isSafeViaWc,
      isSafeWallet,
      isSmartContractWallet,
    })
  }, [account, accountType, isSafeViaWc, isSafeWallet, isSmartContractWallet])

  return { isSafeViaWc, isWalletTypePending, walletType }
}

function useTrackTwapDemandEventOncePerSession(
  account?: string,
): (action: TwapDemandAnalyticsEvent, trackEvent: () => void) => void {
  const fallbackSessionKeys = useRef<Set<string>>(new Set())

  return useCallback(
    (action: TwapDemandAnalyticsEvent, trackEvent: () => void) => {
      const storageKey = getTwapDemandSessionStorageKey(action, account)

      if (fallbackSessionKeys.current.has(storageKey)) return
      if (!markTwapDemandEventTrackedInSession(storageKey)) return

      fallbackSessionKeys.current.add(storageKey)
      trackEvent()
    },
    [account],
  )
}
