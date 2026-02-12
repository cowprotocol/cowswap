import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback, useEffect } from 'react'

import { useWalletDetails } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import { Trash2 } from 'react-feather'

import { useMultipleOrdersCancellation } from 'common/hooks/useMultipleOrdersCancellation'
import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/ordersToCancel.atom'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './MultipleCancellationMenu.styled'

interface MultipleCancellationMenuProps {
  pendingOrders: ParsedOrder[]
}

export function MultipleCancellationMenu({ pendingOrders }: MultipleCancellationMenuProps): ReactNode {
  const { allowsOffchainSigning } = useWalletDetails()
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const multipleCancellation = useMultipleOrdersCancellation()

  const ordersToCancelCount = ordersToCancel.length || 0

  const cancelAllPendingOrders = useCallback(() => {
    multipleCancellation(pendingOrders)
  }, [multipleCancellation, pendingOrders])

  const cancelSelectedOrders = useCallback(() => {
    multipleCancellation(ordersToCancel)
  }, [ordersToCancel, multipleCancellation])

  const clearSelection = useCallback(() => {
    updateOrdersToCancel([])
  }, [updateOrdersToCancel])

  // Enable checkboxes displaying in the orders table once
  useEffect(() => {
    clearSelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cancellableOrders = pendingOrders.filter(isOrderOffChainCancellable)

  if (cancellableOrders.length === 0 || !allowsOffchainSigning) return null

  return (
    <styledEl.Wrapper hasSelectedItems={!!ordersToCancelCount}>
      {ordersToCancelCount ? (
        <>
          <styledEl.ActionButton onClick={cancelSelectedOrders}>
            <Trash2 size={14} /> <Trans>Cancel</Trans> {ordersToCancelCount} <Trans>selected</Trans>
          </styledEl.ActionButton>
          <styledEl.TextButton onClick={clearSelection}>
            <Trans>Clear selection</Trans>
          </styledEl.TextButton>
        </>
      ) : (
        <styledEl.CancelAllButton onClick={cancelAllPendingOrders}>
          <Trans>Cancel all</Trans>
        </styledEl.CancelAllButton>
      )}
    </styledEl.Wrapper>
  )
}
