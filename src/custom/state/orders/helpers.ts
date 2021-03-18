import { formatOrderId } from 'utils'
import { OrderID } from 'utils/operator'
import { addPopup } from 'state/application/actions'
import { OrderStatus } from './actions'

type OrderStatusExtended = OrderStatus | 'submitted'

interface SetOrderSummaryParams {
  id: string
  status: OrderStatusExtended
  summary?: string
  descriptor?: string
}

// what is passed to addPopup action
export type PopupPayload = Parameters<typeof addPopup>[0]
export interface OrderIDWithPopup {
  id: OrderID
  popup: PopupPayload
}

export enum OrderTxTypes {
  METATXN = 'metatxn',
  TXN = 'txn'
}

enum OrderIdType {
  ID = 'id',
  HASH = 'hash'
}

interface BasePopupContent {
  success: boolean
  summary: string
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
  return summary ? `${summary} ${descriptor || status}` : `Order ${formatOrderId(id)} ${descriptor || status}`
}

// Metatxn popup
export function setPopupData(
  type: OrderTxTypes.METATXN,
  { success, id, summary, status, descriptor }: SetOrderSummaryParams & { success?: boolean }
): { key?: string; content: MetaPopupContent }
// Txn popup
export function setPopupData(
  type: OrderTxTypes.TXN,
  { success, id, summary, status, descriptor }: SetOrderSummaryParams & { hash: string; success?: boolean }
): { key?: string; content: TxnPopupContent }
export function setPopupData(
  type: OrderTxTypes,
  { hash, success = true, id, summary, status, descriptor }: any
): { key?: string; content: TxnPopupContent | MetaPopupContent } {
  const key = id + '_' + status
  const baseContent = {
    success,
    summary: setOrderSummary({
      summary,
      id,
      status,
      descriptor
    })
  }
  let content: TxnPopupContent | MetaPopupContent
  if (type === OrderTxTypes.TXN) {
    content = {
      txn: {
        hash,
        ...baseContent
      }
    }
  } else {
    content = {
      metatxn: {
        id,
        ...baseContent
      }
    }
  }

  return { key, content }
}
