import { useCallback, useEffect } from 'react'
import { ordersToCancelAtom, updateOrdersToCancelAtom } from '@cow/common/hooks/useMultipleOrdersCancellation/state'
import { useMultipleOrdersCancellation } from '@cow/common/hooks/useMultipleOrdersCancellation'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import styled from 'styled-components/macro'
import { transparentize } from 'polished'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useWalletDetails } from '@cow/modules/wallet'
import { Trash2 } from 'react-feather'
import { isOrderOffChainCancellable } from '@cow/common/utils/isOrderOffChainCancellable'

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
  background: ${({ theme }) => transparentize(0.86, theme.danger)};
  color: ${({ theme }) => theme.danger};
  font-weight: 600;
  text-decoration: none;
  font-size: 13px;
  padding: 10px 15px;
  margin: 0;
  gap: 5px;
  border: 0;
  outline: none;
  cursor: pointer;
  transition: background 0.15s ease-in-out, color 0.2s ease-in-out;
  border-radius: 24px;
  vertical-align: center;

  &:hover:not([disabled]) {
    background: ${({ theme }) => transparentize(0.75, theme.danger)};
  }

  &[disabled] {
    background: transparent;
    outline: 1px solid ${({ theme }) => transparentize(0.88, theme.text3)};
  }
`

const TextButton = styled.button`
  display: inline-block;
  color: ${({ theme }) => theme.text1};
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
  const updateOrdersToCancel = useUpdateAtom(updateOrdersToCancelAtom)
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
      {!!ordersToCancelCount ? (
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
