import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { safeShortenAddress } from 'utils/address'

import { useAffiliateTraderPastOrders } from './useAffiliateTraderPastOrders'
import { useRefCodeFromLocalTrades } from './useRefCodeFromLocalTrades'

import { affiliateTraderSavedCodeAtom, setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'
import { logAffiliate } from '../utils/logger'

export function useAffiliateTraderRecoverySideEffect(): void {
  const { account } = useWalletInfo()
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
      setSavedCode({ savedCode: localCode, isLinked: true })
      return
    }

    if (orderbookCode) {
      logAffiliate(safeShortenAddress(account), 'Recovered trader code from orderbook appData:', orderbookCode)
      setSavedCode({ savedCode: orderbookCode, isLinked: true })
    }
  }, [account, isLinked, localCode, orderbookCode, setSavedCode])
}
