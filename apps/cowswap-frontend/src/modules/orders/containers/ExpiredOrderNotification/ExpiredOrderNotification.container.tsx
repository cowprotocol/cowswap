import { ReactNode } from 'react'

import { OnExpiredOrderPayload, ToastMessageType } from '@cowprotocol/events'
import { UiOrderType } from '@cowprotocol/types'
import { LinkStyledButton } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

import { useSetAlternativeOrder } from 'modules/trade'

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
            <LinkStyledButton onClick={() => setAlternativeOrder({ ...order, apiAdditionalInfo: expiredOrder })}>
              <Trans>Recreate</Trans> <Trans>order</Trans>
            </LinkStyledButton>
          </p>
        )
      }
    />
  )
}
