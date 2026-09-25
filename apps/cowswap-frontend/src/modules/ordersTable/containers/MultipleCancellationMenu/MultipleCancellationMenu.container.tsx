import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback, useEffect } from 'react'

import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'entities/ordersToCancel/ordersToCancel.atom'
import { Trash2 } from 'react-feather'

import { MAX_SOLANA_BATCH_CANCEL_ORDERS } from 'common/constants/common'
import { useMultipleOrdersCancellation } from 'common/hooks/useMultipleOrdersCancellation'
import { isOrderCancellable } from 'common/utils/isOrderCancellable'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './MultipleCancellationMenu.styled'

interface MultipleCancellationMenuProps {
  pendingOrders: ParsedOrder[]
}

export function MultipleCancellationMenu({ pendingOrders }: MultipleCancellationMenuProps): ReactNode {
  const { chainId } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const multipleCancellation = useMultipleOrdersCancellation()

  const isSolana = isSolanaChain(chainId)
  const ordersToCancelCount = ordersToCancel.length || 0

  // Solana cancellation is always one on-chain transaction (no off-chain/EIP-712 signature concept),
  // so eligibility is just "not already cancelled/cancelling" rather than requiring off-chain signing.
  const cancellableOrders = isSolana
    ? pendingOrders.filter(isOrderCancellable)
    : pendingOrders.filter(isOrderOffChainCancellable)

  // Solana batch cancellation bundles the orders into a single transaction, so "cancel all" is capped
  // the same way manual selection is (see useOrderActions) to keep that transaction from overflowing.
  const cancelAllPendingOrders = useCallback(() => {
    multipleCancellation(isSolana ? cancellableOrders.slice(0, MAX_SOLANA_BATCH_CANCEL_ORDERS) : pendingOrders)
  }, [multipleCancellation, pendingOrders, cancellableOrders, isSolana])

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

  if (cancellableOrders.length === 0 || (!isSolana && !allowsOffchainSigning)) return null

  return (
    <styledEl.Wrapper hasSelectedItems={!!ordersToCancelCount}>
      {ordersToCancelCount ? (
        <>
          <styledEl.ActionButton onClick={cancelSelectedOrders}>
            <Trash2 size={14} /> <Trans>Cancel</Trans> {ordersToCancelCount} <Trans>selected</Trans>
          </styledEl.ActionButton>
          {isSolana && ordersToCancelCount >= MAX_SOLANA_BATCH_CANCEL_ORDERS && (
            <styledEl.TextButton
              as="span"
              title={t`Up to ${MAX_SOLANA_BATCH_CANCEL_ORDERS} orders can be cancelled together`}
            >
              <Trans>Max reached</Trans>
            </styledEl.TextButton>
          )}
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
