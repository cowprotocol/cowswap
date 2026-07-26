import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { type SnackbarItem, useAddSnackbar } from '@cowprotocol/snackbars'

import type { Order } from 'legacy/state/orders/actions'

import { useAffiliateTraderInfo } from './useAffiliateTraderInfo'

import { PROGRAM_DEFAULTS } from '../config/affiliateProgram.const'
import { isSupportedTradingNetwork } from '../lib/affiliateProgramUtils'
import { AffiliateLinkedCodeNotification } from '../pure/AffiliateLinkedCodeNotification'
import { AffiliateNotificationIcon } from '../pure/AffiliateNotificationIcon'
import { affiliateTraderSavedCodeAtom, setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

interface NotifyAffiliateLinkedCodeParams {
  order: Order | undefined
  chainId: SupportedChainId
}

/**
 * Builds the 'code linked' snackbar. The id is keyed on the ref code (not the order) so the toast is
 * shown once regardless of which detection path fires it — the fulfilled-order event or the
 * partial-aware local-trade recovery — avoiding a duplicate toast if both run.
 */
export function buildAffiliateLinkedCodeSnackbar(refCode: string, timeCapDays: number): SnackbarItem {
  return {
    id: `affiliate-linked-code-${refCode}`,
    icon: 'custom',
    customIcon: <AffiliateNotificationIcon />,
    duration: 0,
    content: <AffiliateLinkedCodeNotification code={refCode} timeCapDays={timeCapDays} />,
  }
}

export function useNotifyAffiliateLinkedCode({ order, chainId }: NotifyAffiliateLinkedCodeParams): void {
  const { savedCode: refCode, isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)
  const addSnackbar = useAddSnackbar()

  const { data: codeInfo } = useAffiliateTraderInfo(refCode)
  const timeCapDays = codeInfo?.timeCapDays ?? PROGRAM_DEFAULTS.AFFILIATE_TIME_CAP_DAYS

  useEffect(() => {
    if (!order || !refCode || isLinked || !isSupportedTradingNetwork(chainId)) return

    setSavedCode({ savedCode: refCode, isLinked: true })
    addSnackbar(buildAffiliateLinkedCodeSnackbar(refCode, timeCapDays))
  }, [addSnackbar, chainId, isLinked, order, refCode, setSavedCode, timeCapDays])
}
