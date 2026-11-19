import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'

import { Command } from '@cowprotocol/types'

import { useCloseModals } from 'legacy/state/application/hooks'

import { useCloseAccountModal } from 'modules/account'
import { approveProgressModalStateAtom } from 'modules/erc20Approve'
import { useCloseAllModalsRequest } from 'modules/injectedWidget'
import { useZeroApprovalState } from 'modules/zeroApproval'

import { useSetOrdersTableDrawerOpen } from './useSetOrdersTableDrawerOpen'
import { useTradeConfirmState } from './useTradeConfirmState'

/**
 * Closes the trade screens, orders table and other modals when the widget integrator calls `closeAllModals()`.
 * A request is dropped while the wallet signs a trade, an approval or an allowance reset: closing would hide that flow, not stop it.
 */
export function useCloseModalsOnWidgetRequest(resetTradeScreens: Command, isGenericModalPending = false): void {
  const closeAllModalsRequest = useCloseAllModalsRequest()
  const { pendingTrade } = useTradeConfirmState()
  const { approveInProgress } = useAtomValue(approveProgressModalStateAtom)
  const { isApproving: isZeroApproving } = useZeroApprovalState()
  const isWalletActionPending = !!pendingTrade || approveInProgress || isZeroApproving || isGenericModalPending
  // A request made before this trade widget was mounted is not for it
  const handledRequestRef = useRef(closeAllModalsRequest)
  const setOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen()
  const closeAccountModal = useCloseAccountModal()
  const closeAppModals = useCloseModals()

  useEffect(() => {
    if (handledRequestRef.current === closeAllModalsRequest) return

    handledRequestRef.current = closeAllModalsRequest

    if (isWalletActionPending) return

    resetTradeScreens()
    setOrdersTableDrawerOpen(false)
    closeAccountModal()
    closeAppModals()
  }, [
    closeAllModalsRequest,
    isWalletActionPending,
    resetTradeScreens,
    setOrdersTableDrawerOpen,
    closeAccountModal,
    closeAppModals,
  ])
}
