import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { PercentDisplay } from '@cowprotocol/ui/pure/PercentDisplay'

import { ProgressBar } from 'components/common/ProgressBar'

import { Order } from 'api/operator'

import { OrderAssetsInfo } from './OrderAssetsInfo'
import { PriceWithTitle } from './PriceWithTitle'
import { FilledContainer, StyledSurplusComponent, TableHeading, TableHeadingContent, Wrapper } from './styled'
import { useFilledProgressContext } from './useFilledProgressContext'

export type Props = {
  order: Order
  isPriceInverted?: boolean
  invertPrice?: Command
  fullView?: boolean
  lineBreak?: boolean
}

export function FilledProgress(props: Props): ReactNode {
  const {
    isPriceInverted,
    invertPrice,
    order: { sellAmount, buyAmount, executedBuyAmount, executedSellAmount, buyToken, sellToken },
  } = props

  const context = useFilledProgressContext(props.order)

  const { formattedPercentage, surplus, surplusToken } = context
  const orderAssetsInfo = <OrderAssetsInfo lineBreak={props.lineBreak} context={context} />

  const priceViewContext = {
    buyToken,
    sellToken,
    showInvertButton: true,
    isPriceInverted,
    invertPrice,
  }

  return !props.fullView ? (
    <Wrapper>
      <ProgressBar percentage={formattedPercentage} />
      {orderAssetsInfo}
    </Wrapper>
  ) : (
    <TableHeading>
      <TableHeadingContent>
        <FilledContainer>
          <p className="title">Filled</p>
          <div>
            <p className="percentage">
              <PercentDisplay percent={formattedPercentage} />
            </p>
            {orderAssetsInfo}
          </div>
          <ProgressBar showLabel={false} percentage={formattedPercentage} />
        </FilledContainer>
      </TableHeadingContent>
      <PriceWithTitle
        title="Avg. Execution Price"
        buyAmount={executedBuyAmount}
        sellAmount={executedSellAmount}
        {...priceViewContext}
      />
      <TableHeadingContent className="surplus">
        <p className="title">Total Surplus</p>
        <StyledSurplusComponent surplus={surplus} token={surplusToken} />
      </TableHeadingContent>
      <PriceWithTitle title="Limit Price" buyAmount={buyAmount} sellAmount={sellAmount} {...priceViewContext} />
    </TableHeading>
  )
}
