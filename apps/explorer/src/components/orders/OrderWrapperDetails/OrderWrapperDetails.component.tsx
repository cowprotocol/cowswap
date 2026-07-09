import { ReactElement } from 'react'

import { OrderWrapperDetailsItem } from 'components/orders/OrderWrapperDetails/item/OrderWrapperDetailsItem.component'

import { OrderCtxProvider } from './OrderWrapperDetails.provider'
import * as styledEl from './OrderWrapperDetails.styled'

import { Order } from '../../../api/operator'
import { getOrderWrappers } from '../../../utils/getOrderWrappers'

interface OrderWrapperDetailsProps {
  fullAppData: string | undefined
  order?: Order
  children: (content: ReactElement) => ReactElement
}

export function OrderWrapperDetails({ fullAppData, order, children }: OrderWrapperDetailsProps): ReactElement | null {
  const wrappers = getOrderWrappers(fullAppData)

  if (wrappers.length === 0) return null

  return (
    <OrderCtxProvider order={order ?? null}>
      {children(
        <styledEl.WrapperList>
          {wrappers.map((wrapper) => (
            <OrderWrapperDetailsItem key={`${wrapper.address}-${wrapper.data ?? ''}`} wrapper={wrapper} />
          ))}
        </styledEl.WrapperList>,
      )}
    </OrderCtxProvider>
  )
}
