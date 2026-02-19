import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { safeShortenAddress } from 'utils/address'

import { useRefCodeFromLocalTrades } from '../hooks/useRefCodeFromLocalTrades'
import { useRefCodeFromOrderbookTrades } from '../hooks/useRefCodeFromOrderbookTrades'
import { affiliateTraderAtom } from '../state/affiliateTraderAtom'
import { setRecoveredTraderReferralCodeAtom } from '../state/affiliateTraderWriteAtoms'
import { logAffiliate } from '../utils/logger'

export function AffiliateTraderRecoverySideEffect(): ReactNode {
  const { account } = useWalletInfo()
  const { isLinked, savedCode } = useAtomValue(affiliateTraderAtom)
  const setRecoveredCode = useSetAtom(setRecoveredTraderReferralCodeAtom)
  const localCode = useRefCodeFromLocalTrades(account)
  const { data: orderbookCode, isLoading: isLoadingOrderbookRefCode } = useRefCodeFromOrderbookTrades({
    account,
    enabled: !localCode && !!account,
  })

  useEffect(() => {
    if (!account) {
      return
    }

    if (localCode) {
      logAffiliate(safeShortenAddress(account), 'Recovered trader code from local orders:', localCode)
      setRecoveredCode(localCode)
      return
    }

    if (isLoadingOrderbookRefCode) {
      return
    }

    if (!orderbookCode) {
      if (isLinked || savedCode) {
        logAffiliate(safeShortenAddress(account), 'Could not recover trader code. Resetting persisted recovered state.')
        setRecoveredCode(undefined)
      }
      return
    }

    logAffiliate(safeShortenAddress(account), 'Recovered trader code from orderbook appData:', orderbookCode)
    setRecoveredCode(orderbookCode)
  }, [account, isLinked, isLoadingOrderbookRefCode, localCode, orderbookCode, savedCode, setRecoveredCode])

  return null
}
