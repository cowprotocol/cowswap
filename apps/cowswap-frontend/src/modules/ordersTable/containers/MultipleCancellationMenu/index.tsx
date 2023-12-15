import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import { UI } from '@cowprotocol/ui'
import { useWalletDetails } from '@cowprotocol/wallet'

import { Trash2 } from 'react-feather'
import styled from 'styled-components/macro'

import { useMultipleOrdersCancellation } from 'common/hooks/useMultipleOrdersCancellation'
import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

interface Props {
  pendingOrders: ParsedOrder[]
}

const Wrapper = styled.div<{ hasSelectedItems: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-left: ${({ hasSelectedItems }) => (hasSelectedItems ? '' : 'auto')};
  margin: 0 10px 0 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    justify-content: center;
    margin: 15px auto 0;
  `}
`

const ActionButton = styled.button`
  display: inline-flex;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  font-weight: 600;
  text-decoration: none;
  font-size: 13px;
  padding: 10px 15px;
  margin: 0;
  gap: 5px;
  border: 0;
  outline: none;
  cursor: pointer;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;
  border-radius: 24px;
  vertical-align: center;

  &:hover:not([disabled]) {
    background: var(${UI.COLOR_DANGER_BG});
  }

  &[disabled] {
    background: transparent;
    outline: 1px solid var(${UI.COLOR_PAPER_DARKER});
  }
`

const TextButton = styled.button`
  display: inline-block;
  color: inherit;
  font-size: 13px;
  padding: 5px 10px;
  cursor: pointer;
  background: none;
  outline: none;
  border: none;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

const CancelAllButton = styled(TextButton)`
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.danger};
    text-decoration: underline;
  }
`

export function MultipleCancellationMenu({ pendingOrders }: Props) {
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
    <Wrapper hasSelectedItems={!!ordersToCancelCount}>
      {ordersToCancelCount ? (
        <>
          <ActionButton onClick={cancelSelectedOrders}>
            <Trash2 size={14} /> Cancel {ordersToCancelCount} selected
          </ActionButton>
          <TextButton onClick={clearSelection}>Clear selection</TextButton>
        </>
      ) : (
        <CancelAllButton onClick={cancelAllPendingOrders}>Cancel all</CancelAllButton>
      )}
    </Wrapper>
  )
}
