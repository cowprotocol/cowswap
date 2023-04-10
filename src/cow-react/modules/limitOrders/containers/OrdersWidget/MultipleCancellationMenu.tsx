import { useCallback } from 'react'
import { useAtom } from 'jotai'
import { ordersToCancelAtom } from '@cow/common/hooks/useMultipleOrdersCancellation/state'
import { useMultipleOrdersCancellation } from '@cow/common/hooks/useMultipleOrdersCancellation'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import styled from 'styled-components/macro'
import { transparentize } from 'polished'
import { CloseIcon } from 'theme'

interface Props {
  pendingOrders: ParsedOrder[]
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  margin-bottom: 15px;
  gap: 10px;
`

const ActionButton = styled.button`
  display: inline-block;
  background: ${({ theme }) => transparentize(0.88, theme.text3)};
  color: ${({ theme }) => theme.text1};
  font-weight: 600;
  text-decoration: none;
  font-size: 13px;
  padding: 10px 24px;
  border: 0;
  outline: none;
  cursor: pointer;
  transition: background 0.15s ease-in-out, color 0.2s ease-in-out;
  border-radius: 4px;

  &:hover:not([disabled]) {
    background: ${({ theme }) => theme.bg1};
    color: ${({ theme }) => theme.text1};
  }

  &[disabled] {
    background: transparent;
    outline: 1px solid ${({ theme }) => transparentize(0.88, theme.text3)};
  }
`

export function MultipleCancellationMenu({ pendingOrders }: Props) {
  const [ordersToCancel, setOrdersToCancel] = useAtom(ordersToCancelAtom)
  const multipleCancellation = useMultipleOrdersCancellation()

  const isMultipleCancelEnabled = ordersToCancel !== null

  const toggleMultipleCancellation = useCallback(() => {
    setOrdersToCancel(isMultipleCancelEnabled ? null : [])
  }, [setOrdersToCancel, isMultipleCancelEnabled])

  const cancelAllPendingOrders = useCallback(() => {
    multipleCancellation(pendingOrders)
  }, [multipleCancellation, pendingOrders])

  const toggleOrCancel = useCallback(() => {
    if (isMultipleCancelEnabled) {
      if (!ordersToCancel?.length) return

      multipleCancellation(ordersToCancel)
    } else {
      toggleMultipleCancellation()
    }
  }, [isMultipleCancelEnabled, ordersToCancel, multipleCancellation, toggleMultipleCancellation])

  if (pendingOrders.length === 0) return null

  return (
    <Wrapper>
      {isMultipleCancelEnabled && <CloseIcon onClick={toggleMultipleCancellation}></CloseIcon>}
      <ActionButton disabled={ordersToCancel?.length === 0} onClick={toggleOrCancel}>
        {isMultipleCancelEnabled ? `Cancel (${ordersToCancel.length})` : 'Multiple cancellation'}
      </ActionButton>
      <ActionButton onClick={cancelAllPendingOrders}>Cancel all pending orders</ActionButton>
    </Wrapper>
  )
}
