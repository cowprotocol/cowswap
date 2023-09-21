import { BlockExplorerLinkType, formatOrderId } from '@cowprotocol/common-utils'

import { OrderStatus } from './actions'
import { OrderObject, OrdersStateNetwork } from './reducer'

type OrderStatusExtended = OrderStatus | 'submitted' | 'presigned'

interface SetOrderSummaryParams {
  id: string
  status?: OrderStatusExtended
  summary?: string | JSX.Element
  descriptor?: string | null
  orderType?: BlockExplorerLinkType
}

export enum OrderTxTypes {
  METATXN = 'metatxn',
  TXN = 'txn',
}

enum OrderIdType {
  ID = 'id',
  HASH = 'hash',
}

interface BasePopupContent {
  success: boolean
  summary: string | JSX.Element
  orderType?: BlockExplorerLinkType
}

type IdOrHash<K extends OrderIdType, T extends OrderTxTypes> = {
  [identifier in K]: T extends OrderTxTypes.METATXN ? OrderTxTypes.METATXN : OrderTxTypes.TXN
}

type GPPopupContent<T extends OrderTxTypes> = {
  [type in T]: IdOrHash<T extends OrderTxTypes.METATXN ? OrderIdType.ID : OrderIdType.HASH, T> & BasePopupContent
}

type MetaPopupContent = GPPopupContent<OrderTxTypes.METATXN>
type TxnPopupContent = GPPopupContent<OrderTxTypes.TXN>

function setOrderSummary({ id, summary, status, descriptor }: SetOrderSummaryParams) {
  // If there isn't summary, return generalized summary
  if (!summary) {
    return `Order ${formatOrderId(id)} ${descriptor || status || ''}`
  }

  if (typeof summary === 'string') {
    // If descriptor is specifically null, just return summary
    if (descriptor === null) {
      return summary
    }

    // Otherwise return summary with descriptor or status
    return `${summary} ${descriptor || status || ''}`
  }

  return summary
}

// Metatxn popup
export function setPopupData(
  type: OrderTxTypes.METATXN,
  {
    success,
    id,
    summary,
    status,
    descriptor,
  }: SetOrderSummaryParams & { success?: boolean; orderType?: BlockExplorerLinkType }
): { key?: string; content: MetaPopupContent }
// Txn popup
export function setPopupData(
  type: OrderTxTypes.TXN,
  { success, id, summary, status, descriptor }: SetOrderSummaryParams & { hash: string; success?: boolean }
): { key?: string; content: TxnPopupContent }
export function setPopupData(
  type: OrderTxTypes,
  { hash, success = true, id, summary, status, descriptor, orderType }: any
): { key?: string; content: TxnPopupContent | MetaPopupContent } {
  const key = id + '_' + status
  const baseContent = {
    success,
    summary: setOrderSummary({
      summary,
      id,
      status,
      descriptor,
    }),
  }

  let content: TxnPopupContent | MetaPopupContent
  if (type === OrderTxTypes.TXN) {
    content = {
      txn: {
        hash,
        ...baseContent,
      },
    }
  } else {
    content = {
      metatxn: {
        id,
        ...baseContent,
        orderType,
      },
    }
  }

  return { key, content }
}

export function getOrderByIdFromState(orders: OrdersStateNetwork | undefined, id: string): OrderObject | undefined {
  if (!orders) {
    return
  }

  const { pending, presignaturePending, fulfilled, expired, cancelled, creating, failed, scheduled } = orders

  return (
    pending?.[id] ||
    presignaturePending?.[id] ||
    fulfilled?.[id] ||
    expired?.[id] ||
    cancelled?.[id] ||
    creating?.[id] ||
    scheduled?.[id] ||
    failed?.[id]
  )
}
