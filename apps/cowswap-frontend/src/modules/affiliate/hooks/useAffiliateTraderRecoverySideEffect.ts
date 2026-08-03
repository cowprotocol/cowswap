import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { useAddSnackbar, useRemoveSnackbar } from '@cowprotocol/snackbars'
import { useWalletInfo } from '@cowprotocol/wallet'

import { safeShortenAddress } from 'utils/address'

import { useAffiliateTraderInfo } from './useAffiliateTraderInfo'
import { useAffiliateTraderPastOrders } from './useAffiliateTraderPastOrders'
import { buildAffiliateLinkedCodeSnackbar } from './useNotifyAffiliateLinkedCode'
import { useRefCodeFromLocalTrades } from './useRefCodeFromLocalTrades'

import { PROGRAM_DEFAULTS } from '../config/affiliateProgram.const'
import { affiliateTraderSavedCodeAtom, setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'
import { logAffiliate } from '../utils/logger'

// Captured once when the module loads (≈ app start). A code is only toasted when it comes from an
// order created after this point — a partial fill linking a code live in this session. Codes carried
// by orders created earlier are historical links and stay silent, even though redux hydrates them
// asynchronously after mount (so "appeared after mount" can't tell them apart). Comparing the order's
// own creation time against a fixed session start avoids that hydration race entirely (#7527).
const SESSION_START_MS = Date.now()

export function useAffiliateTraderRecoverySideEffect(): boolean {
  const { account } = useWalletInfo()
  const { isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)
  const addSnackbar = useAddSnackbar()
  const removeSnackbar = useRemoveSnackbar()
  const { code: localCode, linkedAt: localLinkedAt } = useRefCodeFromLocalTrades(account)
  const { data: pastTradesCheck } = useAffiliateTraderPastOrders({
    account,
    enabled: !localCode && !isLinked,
  })
  const orderbookCode = pastTradesCheck?.refCode
  const isRecoverySettling = Boolean(!isLinked && (localCode || orderbookCode))

  const { data: localCodeInfo } = useAffiliateTraderInfo(localCode)
  const localCodeTimeCapDays = localCodeInfo?.timeCapDays ?? PROGRAM_DEFAULTS.AFFILIATE_TIME_CAP_DAYS

  // Id of the affiliate toast currently shown, so it can be dismissed when the account changes.
  const shownSnackbarIdRef = useRef<string | null>(null)
  const prevAccountRef = useRef(account)

  // Dismiss a lingering 'code linked' toast when the account changes, so it doesn't stay on screen
  // for (or bleed into) a different account (#7527).
  useEffect(() => {
    if (prevAccountRef.current !== account) {
      if (shownSnackbarIdRef.current) {
        removeSnackbar(shownSnackbarIdRef.current)
        shownSnackbarIdRef.current = null
      }
      prevAccountRef.current = account
    }
  }, [account, removeSnackbar])

  useEffect(() => {
    if (!account || isLinked) {
      return
    }

    if (localCode) {
      logAffiliate(safeShortenAddress(account), 'Recovered trader code from local orders:', localCode)
      setSavedCode({ savedCode: localCode, isLinked: true })
      // Only notify when the code was linked live this session, i.e. it comes from an order created
      // after the session started (a partial fill happening now). A code carried by an order created
      // earlier is a historical link and stays silent, like the orderbook path below — otherwise
      // every visit to an already-linked account would re-show the toast (#7527). The snackbar id is
      // keyed on the code, so it also dedupes with the fulfilled-order path if both ever run.
      const isLiveLink = localLinkedAt ? Date.parse(localLinkedAt) > SESSION_START_MS : false
      if (isLiveLink) {
        const snackbar = buildAffiliateLinkedCodeSnackbar(localCode, localCodeTimeCapDays)
        addSnackbar(snackbar)
        shownSnackbarIdRef.current = snackbar.id
      }
      return
    }

    if (orderbookCode) {
      // Cross-device recovery from orderbook appData stays silent: the toast was already shown on the
      // device where the code was originally linked.
      logAffiliate(safeShortenAddress(account), 'Recovered trader code from orderbook appData:', orderbookCode)
      setSavedCode({ savedCode: orderbookCode, isLinked: true })
    }
  }, [account, addSnackbar, isLinked, localCode, localLinkedAt, localCodeTimeCapDays, orderbookCode, setSavedCode])

  return isRecoverySettling
}
