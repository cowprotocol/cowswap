import { Order, OrderFulfillmentData } from 'state/orders/actions'
import { getOrder, OrderID, OrderMetaData } from 'api/gnosisProtocol'
import { stringToCurrency } from 'state/swap/extension'
import { formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'
import { OrderTransitionStatus, classifyOrder } from 'state/orders/utils'
import { SupportedChainId as ChainId } from 'constants/chains'

export type OrderLogPopupMixData = OrderFulfillmentData | OrderID

function _computeFulfilledSummary({
  orderFromStore,
  orderFromApi,
}: {
  orderFromStore?: Order
  orderFromApi: OrderMetaData | null
}) {
  // Default to store's current order summary
  let summary: string | undefined = orderFromStore?.summary

  // if we can find the order from the API
  // and our specific order exists in our state, let's use that
  if (orderFromApi) {
    const { buyToken, sellToken, executedBuyAmount, executedSellAmount } = orderFromApi

    if (orderFromStore) {
      const { inputToken, outputToken } = orderFromStore
      // don't show amounts in atoms
      const inputAmount = stringToCurrency(executedSellAmount, inputToken)
      const outputAmount = stringToCurrency(executedBuyAmount, outputToken)

      summary = `Swap ${formatSmart(inputAmount, AMOUNT_PRECISION)} ${inputAmount.currency.symbol} for ${formatSmart(
        outputAmount,
        AMOUNT_PRECISION
      )} ${outputAmount.currency.symbol}`
    } else {
      // We only have the API order info, let's at least use that
      summary = `Swap ${sellToken} for ${buyToken}`
    }
  } else {
    console.log(`[state:orders:updater] computeFulfilledSummary::API data not yet in sync with blockchain`)
  }

  return summary
}

type PopupData = {
  status: OrderTransitionStatus
  popupData?: OrderLogPopupMixData
}

export async function fetchOrderPopupData(orderFromStore: Order, chainId: ChainId): Promise<PopupData> {
  // Get order from API
  const orderFromApi = await getOrder(chainId, orderFromStore.id)

  console.log('[orderFromApi}', orderFromApi)

  const status = classifyOrder(orderFromApi)

  let popupData = undefined

  switch (status) {
    case 'fulfilled':
      popupData = {
        id: orderFromStore.id,
        fulfillmentTime: new Date().toISOString(),
        transactionHash: '', // there's no need  for a txHash as we'll link the notification to the Explorer
        summary: _computeFulfilledSummary({ orderFromStore, orderFromApi }),
        apiAdditionalInfo: orderFromApi
          ? {
              ...orderFromApi,
            }
          : undefined,
      }
      break
    case 'expired':
    case 'cancelled':
    case 'presigned':
      popupData = orderFromStore.id
      break
    default:
      // No popup for other states
      break
  }

  return { status, popupData }
}
