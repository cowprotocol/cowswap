import { ReactNode, useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId, getChainInfo, ChainInfo } from '@cowprotocol/cow-sdk'

import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'

import { useUltimateOrder } from 'common/hooks/useUltimateOrder'
import { getUltimateOrderTradeAmounts } from 'common/updaters/orders/utils'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { OrderNotificationContent, OrderNotificationContentProps } from '../../pure/OrderNotificationContent'
import { OrderNotificationInfo } from '../../types'

interface BaseOrderNotificationProps extends Omit<OrderNotificationContentProps, 'orderInfo'> {
  chainId: SupportedChainId
  orderUid: string
  orderInfo?: OrderNotificationInfo
}

export function OrderNotification(props: BaseOrderNotificationProps): ReactNode {
  const { orderUid, chainId, orderInfo: _orderInfo, ...rest } = props
  const ultimateOrder = useUltimateOrder(chainId, orderUid)

  const orderInfo: OrderNotificationInfo | undefined = useMemo(() => {
    if (_orderInfo) return _orderInfo

    if (ultimateOrder) {
      const { id, kind, owner, receiver } = ultimateOrder.orderFromStore

      return {
        ...getUltimateOrderTradeAmounts(ultimateOrder),
        orderUid: id,
        kind: kind,
        owner: owner,
        orderType: getUiOrderType(ultimateOrder.orderFromStore),
        isEthFlowOrder: getIsNativeToken(ultimateOrder.orderFromStore.inputToken),
        receiver: ultimateOrder.bridgeOrderFromStore?.recipient ?? receiver,
      }
    }

    return undefined
  }, [ultimateOrder, _orderInfo])

  const { srcChainData, dstChainData } = useTradeChainsInfo(
    orderInfo?.inputAmount.currency.chainId,
    orderInfo?.outputAmount.currency.chainId,
  )

  if (!orderInfo) return

  return (
    <OrderNotificationContent {...rest} orderInfo={orderInfo} srcChainData={srcChainData} dstChainData={dstChainData} />
  )
}

function useTradeChainsInfo(
  sourceChainId: SupportedChainId | undefined,
  destChainId: SupportedChainId | undefined,
): { srcChainData: ChainInfo | undefined; dstChainData: ChainInfo | undefined } {
  const srcChainData = sourceChainId ? getChainInfo(sourceChainId) : undefined
  const dstChainData = useBridgeSupportedNetwork(destChainId)

  return { srcChainData, dstChainData }
}
