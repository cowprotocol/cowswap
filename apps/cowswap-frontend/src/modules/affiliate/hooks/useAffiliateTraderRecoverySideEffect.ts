import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'

import { safeShortenAddress } from 'utils/address'

import { useAffiliateTraderPastOrders } from './useAffiliateTraderPastOrders'
import { useRefCodeFromLocalTrades } from './useRefCodeFromLocalTrades'

import { AffiliateCodeSource } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { affiliateTraderSavedCodeAtom, setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'
import { logAffiliate } from '../utils/logger'

export function useAffiliateTraderRecoverySideEffect(): void {
  const { account } = useWalletInfo()
  const analytics = useCowAnalytics()
  const { isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)
  const localCode = useRefCodeFromLocalTrades(account)
  const { data: pastTradesCheck } = useAffiliateTraderPastOrders({
    account,
    enabled: !localCode && !isLinked,
  })
  const orderbookCode = pastTradesCheck?.refCode

  useEffect(() => {
    if (!account || isLinked) {
      return
    }

    if (localCode) {
      logAffiliate(safeShortenAddress(account), 'Recovered trader code from local orders:', localCode)
      trackAffiliateEvent({
        analytics,
        action: 'affiliate_trader_linked_code_recovered',
        codeSource: AffiliateCodeSource.LOCAL_ORDER_RECOVERY,
      })
      setSavedCode({ savedCode: localCode, isLinked: true, source: AffiliateCodeSource.LOCAL_ORDER_RECOVERY })
      return
    }

    if (orderbookCode) {
      logAffiliate(safeShortenAddress(account), 'Recovered trader code from orderbook appData:', orderbookCode)
      trackAffiliateEvent({
        analytics,
        action: 'affiliate_trader_linked_code_recovered',
        codeSource: AffiliateCodeSource.ORDERBOOK_RECOVERY,
      })
      setSavedCode({ savedCode: orderbookCode, isLinked: true, source: AffiliateCodeSource.ORDERBOOK_RECOVERY })
    }
  }, [account, analytics, isLinked, localCode, orderbookCode, setSavedCode])
}
