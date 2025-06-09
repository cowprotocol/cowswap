import React, { ReactNode } from 'react'

import { OrderPriceDisplay, OrderPriceDisplayProps } from '../OrderPriceDisplay'

interface PriceWithTitleProps extends OrderPriceDisplayProps {
  title: string
}

export function PriceWithTitle(props: PriceWithTitleProps): ReactNode {
  const { title, ...priceProps } = props
  return (
    <TableHeadingContent>
      <p className="title">{title}</p>
      <p className="priceNumber">
        {priceProps.buyToken && priceProps.sellToken && <OrderPriceDisplay {...priceProps} />}
      </p>
    </TableHeadingContent>
  )
}
