import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useAddSnackbar } from '@cowprotocol/snackbars'
import { useWalletInfo } from '@cowprotocol/wallet'

import { safeShortenAddress } from 'utils/address'

import { useAffiliateTraderInfo } from './useAffiliateTraderInfo'
import { useAffiliateTraderPastOrders } from './useAffiliateTraderPastOrders'
import { buildAffiliateLinkedCodeSnackbar } from './useNotifyAffiliateLinkedCode'
import { useRefCodeFromLocalTrades } from './useRefCodeFromLocalTrades'

import { PROGRAM_DEFAULTS } from '../config/affiliateProgram.const'
import { affiliateTraderSavedCodeAtom, setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'
import { logAffiliate } from '../utils/logger'

export function useAffiliateTraderRecoverySideEffect(): boolean {
  const { account } = useWalletInfo()
  const { isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)
  const addSnackbar = useAddSnackbar()
  const localCode = useRefCodeFromLocalTrades(account)
  const { data: pastTradesCheck } = useAffiliateTraderPastOrders({
    account,
    enabled: !localCode && !isLinked,
  })
  const orderbookCode = pastTradesCheck?.refCode
  const isRecoverySettling = Boolean(!isLinked && (localCode || orderbookCode))

  const { data: localCodeInfo } = useAffiliateTraderInfo(localCode)
  const localCodeTimeCapDays = localCodeInfo?.timeCapDays ?? PROGRAM_DEFAULTS.AFFILIATE_TIME_CAP_DAYS

  useEffect(() => {
    if (!account || isLinked) {
      return
    }

    if (localCode) {
      logAffiliate(safeShortenAddress(account), 'Recovered trader code from local orders:', localCode)
      setSavedCode({ savedCode: localCode, isLinked: true })
      // A partially-filled order never reaches FULFILLED, so the fulfilled-order toast never fires for
      // it. Notify here from the partial-aware local-trade detection instead. The snackbar id is keyed
      // on the code, so this dedupes with the fulfilled-order path if both ever run.
      addSnackbar(buildAffiliateLinkedCodeSnackbar(localCode, localCodeTimeCapDays))
      return
    }

    if (orderbookCode) {
      // Cross-device recovery from orderbook appData stays silent: the toast was already shown on the
      // device where the code was originally linked.
      logAffiliate(safeShortenAddress(account), 'Recovered trader code from orderbook appData:', orderbookCode)
      setSavedCode({ savedCode: orderbookCode, isLinked: true })
    }
  }, [account, addSnackbar, isLinked, localCode, localCodeTimeCapDays, orderbookCode, setSavedCode])

  return isRecoverySettling
}
