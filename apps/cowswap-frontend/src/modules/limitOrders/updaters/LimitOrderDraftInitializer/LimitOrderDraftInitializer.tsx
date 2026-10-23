import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { pendingLimitOrderDraftAtom } from 'modules/limitOrderDraft'

import { useLimitOrdersDerivedState } from '../../hooks/useLimitOrdersDerivedState'
import {
  applyLimitOrderDraftAtom,
  matchesLimitOrderDraftSession,
  resetLimitOrderDraftSessionAtom,
} from '../../state/applyLimitOrderDraft.atom'

export function LimitOrderDraftInitializer(): null {
  const request = useAtomValue(pendingLimitOrderDraftAtom)
  const setRequest = useSetAtom(pendingLimitOrderDraftAtom)
  const applyDraft = useSetAtom(applyLimitOrderDraftAtom)
  const resetSession = useSetAtom(resetLimitOrderDraftSessionAtom)
  const { pathname } = useLocation()
  const { account, chainId } = useWalletInfo()
  const session = useMemo(() => ({ pathname, account, chainId }), [pathname, account, chainId])
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()

  useEffect(() => () => resetSession(session), [session, resetSession])

  useEffect(() => {
    if (!request) return
    if (!matchesLimitOrderDraftSession(request, session)) {
      setRequest(null)
      return
    }
    const { draft } = request
    const matchesPair =
      inputCurrency &&
      outputCurrency &&
      inputCurrency.chainId === draft.inputAmount.currency.chainId &&
      outputCurrency.chainId === draft.outputCurrency.chainId &&
      areAddressesEqual(getCurrencyAddress(inputCurrency), getCurrencyAddress(draft.inputAmount.currency)) &&
      areAddressesEqual(getCurrencyAddress(outputCurrency), draft.outputCurrency.address)
    if (matchesPair) applyDraft(request)
  }, [request, session, inputCurrency, outputCurrency, applyDraft, setRequest])

  return null
}
