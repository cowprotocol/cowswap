import { ReactNode } from 'react'

import { OnExpiredOrderPayload, ToastMessageType } from '@cowprotocol/events'
import { UiOrderType } from '@cowprotocol/types'
import { LinkStyledButton } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

import { useSetAlternativeOrder } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { useTradeNavigate } from 'common/modules/tradeNavigation'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { OrderNotification } from '../OrderNotification'

interface ExpiredOrderNotificationProps {
  payload: OnExpiredOrderPayload
}

export function ExpiredOrderNotification({ payload }: ExpiredOrderNotificationProps): ReactNode {
  const { chainId, order: expiredOrder } = payload
  const orderUid = expiredOrder.uid
  const order = useOrder({ chainId, id: orderUid })
  const setAlternativeOrder = useSetAlternativeOrder()
  const tradeNavigate = useTradeNavigate()
  const canRecreate = order?.status === OrderStatus.EXPIRED && getUiOrderType(order) === UiOrderType.LIMIT

  return (
    <OrderNotification
      title={t`Order expired`}
      chainId={chainId}
      orderUid={orderUid}
      messageType={ToastMessageType.ORDER_EXPIRED}
      bottomContent={
        canRecreate && (
          <p>
            <LinkStyledButton
              style={{ textDecoration: 'underline' }}
              onClick={() => {
                setAlternativeOrder({ ...order, apiAdditionalInfo: expiredOrder })
                tradeNavigate(
                  chainId,
                  { inputCurrencyId: null, outputCurrencyId: null },
                  undefined,
                  Routes.LIMIT_ORDERS,
                )
              }}
            >
              <Trans>Recreate</Trans> <Trans>order</Trans>
            </LinkStyledButton>
          </p>
        )
      }
    />
  )
}
