import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { Color, Media } from '@cowprotocol/ui'
import { PercentDisplay } from '@cowprotocol/ui/pure/PercentDisplay'

import { ProgressBar } from 'components/common/ProgressBar'
import { Amount, Percentage, SurplusComponent } from 'components/common/SurplusComponent'
import styled from 'styled-components/macro'

import { Order } from 'api/operator'

import { OrderAssetsInfo } from './OrderAssetsInfo'
import { PriceWithTitle } from './PriceWithTitle'
import { useFilledProgressContext } from './useFilledProgressContext'

export type Props = {
  order: Order
  isPriceInverted?: boolean
  invertPrice?: Command
  fullView?: boolean
  lineBreak?: boolean
}

const StyledSurplusComponent = styled(SurplusComponent)`
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  gap: 1rem;
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  color: ${Color.explorer_textPrimary};

  ${Media.upToSmall()} {
    gap: 1rem;
  }

  > span {
    margin: 0 0 0 2rem;
    font-weight: ${({ theme }): string => theme.fontLighter};

    ${Media.upToSmall()} {
      line-height: 1.5;
      margin: 0;
    }
  }

  > span > b {
    font-weight: ${({ theme }): string => theme.fontMedium};
  }
`

const TableHeading = styled.div`
  padding: 1.6rem;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(min-content, 1fr) repeat(3, auto);
  grid-template-rows: max-content;
  justify-content: flex-start;
  gap: 1.6rem;

  ${Media.upToMedium()} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${Media.upToSmall()} {
    grid-template-columns: 1fr;
  }

  .title {
    text-transform: uppercase;
    font-weight: normal;
    font-size: 1.1rem;
    letter-spacing: 0.1rem;
    color: ${Color.explorer_grey};
    margin: 0;
    line-height: 1;
  }

  .percentage,
  ${Percentage} {
    font-size: 3.2rem;
    margin: 0;
    line-height: 1;
    letter-spacing: -0.2rem;
    font-weight: ${({ theme }): string => theme.fontMedium};
    color: ${Color.explorer_green};

    ${Media.upToSmall()} {
      font-size: 2.8rem;
    }
  }

  ${Amount} {
    font-size: 1.2rem;
    margin: 0;
    line-height: 1;

    > span {
      white-space: nowrap;
    }
  }

  .priceNumber {
    font-size: 2.3rem;
    margin: 0;

    ${Media.upToSmall()} {
      font-size: 1.8rem;
    }

    > span {
      line-height: 1.2;
      flex-flow: row wrap;
      color: ${Color.explorer_grey};
    }

    > span > span:first-child {
      color: ${Color.explorer_textPrimary};
    }
  }
`

const TableHeadingContent = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1.4rem;
  border-radius: 0.6rem;
  background: ${Color.explorer_tableRowBorder};
  padding: 2rem 1.8rem;

  ${Media.upToSmall()} {
    flex-direction: column;
  }

  .progress-line {
    width: 100%;
    height: 0.4rem;
  }
`

const FilledContainer = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 1.4rem;
  margin: 0;
  width: 100%;

  > div {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 1.6rem;
  }
`

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
    sellAmount,
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
