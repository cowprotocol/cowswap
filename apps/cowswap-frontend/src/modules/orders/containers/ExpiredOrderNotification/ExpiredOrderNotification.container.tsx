import { ReactNode } from 'react'

import { OnExpiredOrderPayload, ToastMessageType } from '@cowprotocol/events'
import { useRemoveSnackbar } from '@cowprotocol/snackbars'
import { UiOrderType } from '@cowprotocol/types'
import { LinkStyledButton } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

import { useSetAlternativeOrder } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { useTradeNavigate } from 'common/modules/tradeNavigation'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { OrderStatusEvents } from '../../events/events'
import { OrderNotification } from '../OrderNotification'

const RecreateOrderButton = styled(LinkStyledButton)`
  font-weight: 500;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

interface ExpiredOrderNotificationProps {
  payload: OnExpiredOrderPayload
}

export function ExpiredOrderNotification({ payload }: ExpiredOrderNotificationProps): ReactNode {
  const { chainId, order: expiredOrder } = payload
  const orderUid = expiredOrder.uid
  const order = useOrder({ chainId, id: orderUid })
  const setAlternativeOrder = useSetAlternativeOrder()
  const tradeNavigate = useTradeNavigate()
  const removeSnackbar = useRemoveSnackbar()
  const dismissNotification = (): void => removeSnackbar(OrderStatusEvents.ON_EXPIRED_ORDER)
  const canRecreate = order?.status === OrderStatus.EXPIRED && getUiOrderType(order) === UiOrderType.LIMIT

  return (
    <OrderNotification
      title={t`Order expired`}
      chainId={chainId}
      orderUid={orderUid}
      messageType={ToastMessageType.ORDER_EXPIRED}
      onExplorerClick={dismissNotification}
      bottomContent={
        canRecreate && (
          <p>
            <RecreateOrderButton
              onClick={() => {
                dismissNotification()
                setAlternativeOrder({ ...order, apiAdditionalInfo: expiredOrder })
                tradeNavigate(
                  chainId,
                  { inputCurrencyId: order.inputToken.address, outputCurrencyId: order.outputToken.address },
                  undefined,
                  Routes.LIMIT_ORDERS,
                )
              }}
            >
              <Trans>Recreate</Trans> <Trans>order</Trans>
            </RecreateOrderButton>
          </p>
        )
      }
    />
  )
}
