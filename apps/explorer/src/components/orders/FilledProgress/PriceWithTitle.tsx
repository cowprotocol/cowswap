import React, { ReactNode } from 'react'

import { Nullish } from '@cowprotocol/types'

import { TokenErc20 } from '@gnosis.pm/dex-js'

import { TableHeadingContent } from './styled'

import { OrderPriceDisplay, OrderPriceDisplayProps } from '../OrderPriceDisplay'

interface PriceWithTitleProps extends Omit<OrderPriceDisplayProps, 'buyToken' | 'sellToken'> {
  title: string
  buyToken: Nullish<TokenErc20>
  sellToken: Nullish<TokenErc20>
}

export function PriceWithTitle(props: PriceWithTitleProps): ReactNode {
  const { title, ...priceProps } = props
  return (
    <TableHeadingContent>
      <p className="title">{title}</p>
      <p className="priceNumber">
        {priceProps.buyToken && priceProps.sellToken && (
          <OrderPriceDisplay {...(priceProps as OrderPriceDisplayProps)} />
        )}
      </p>
    </TableHeadingContent>
  )
}
