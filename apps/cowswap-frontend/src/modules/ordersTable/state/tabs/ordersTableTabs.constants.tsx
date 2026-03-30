import { ReactNode } from 'react'

import alertCircle from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import orderPresignaturePending from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import SVG from 'react-inlinesvg'

export enum OrderTabId {
  signing = 'signing',
  open = 'open',
  unfillable = 'unfillable',
  history = 'history',
}

export interface OrderTab {
  id: OrderTabId
  title: MessageDescriptor
  icon?: ReactNode
  count: number
  isActive?: boolean
}

export const ORDERS_TABLE_TABS: OrderTab[] = [
  {
    id: OrderTabId.signing,
    title: msg`Signing`,
    icon: <SVG src={orderPresignaturePending} />,
    count: 0,
  },
  {
    id: OrderTabId.open,
    title: msg`Open`,
    count: 0,
  },
  {
    id: OrderTabId.unfillable,
    title: msg`Unfillable`,
    icon: <SVG src={alertCircle} />,
    count: 0,
  },
  {
    id: OrderTabId.history,
    title: msg`Orders history`,
    count: 0,
  },
]

export const ORDERS_TABLE_PAGE_SIZE = 10

export const ORDERS_TABLE_TAB_KEY = 'tab'
export const ORDERS_TABLE_PAGE_KEY = 'page'
