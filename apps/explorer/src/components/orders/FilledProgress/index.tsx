import React from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Color, Media } from '@cowprotocol/ui'
import { PercentDisplay } from '@cowprotocol/ui/pure/PercentDisplay'

import { ProgressBar } from 'components/common/ProgressBar'
import { Amount, Percentage, SurplusComponent } from 'components/common/SurplusComponent'
import { TokenAmount } from 'components/token/TokenAmount'
import styled from 'styled-components/macro'
import { safeTokenName } from 'utils'

import { Order } from 'api/operator'

import { OrderPriceDisplay } from '../OrderPriceDisplay'

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

const OrderAssetsInfoWrapper = styled.span<{ lineBreak?: boolean }>`
  font-size: 1.2rem;
  line-height: normal;

  b:first-child {
    display: ${({ lineBreak }): string => (lineBreak ? 'block' : 'inline')};
  }
`

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function FilledProgress(props: Props): React.ReactNode {
  const {
    lineBreak = false,
    fullView = false,
    isPriceInverted,
    invertPrice,
    order: {
      executedFeeAmount,
      filledAmount,
      filledPercentage,
      kind,
      sellAmount,
      buyAmount,
      executedBuyAmount,
      executedSellAmount,
      buyToken,
      sellToken,
      buyTokenAddress,
      sellTokenAddress,
      surplusAmount,
      surplusPercentage,
    },
  } = props

  const touched = filledPercentage.gt(0)
  const isSell = isSellOrder(kind)

  const mainToken = (isSell ? sellToken : buyToken) || null
  const mainAddress = isSell ? sellTokenAddress : buyTokenAddress
  const swappedToken = (isSell ? buyToken : sellToken) || null
  const swappedAddress = isSell ? buyTokenAddress : sellTokenAddress
  const swappedAmount = isSell ? executedBuyAmount : executedSellAmount
  const action = isSell ? 'sold' : 'bought'
  // Sell orders, add the fee in to the sellAmount (mainAmount, in this case)
  // Buy orders need to add the fee, to the sellToken too (swappedAmount in this case)
  const filledAmountWithFee = isSell ? filledAmount.plus(executedFeeAmount) : filledAmount
  const swappedAmountWithFee = isSell ? swappedAmount : swappedAmount.plus(executedFeeAmount)

  // In case the token object is empty, display the address
  const mainSymbol = mainToken ? safeTokenName(mainToken) : mainAddress
  const swappedSymbol = swappedToken ? safeTokenName(swappedToken) : swappedAddress
  // In case the token object is empty, display the raw amount (`decimals || 0` part)
  const formattedPercentage = filledPercentage.times(100).toString()

  const surplus = { amount: surplusAmount, percentage: surplusPercentage }
  const surplusToken = (isSell ? buyToken : sellToken) || null

  // TODO: Extract nested component outside render function
  // eslint-disable-next-line react/no-unstable-nested-components
  const OrderAssetsInfo = (): React.ReactNode => (
    <>
      {' '}
      <OrderAssetsInfoWrapper lineBreak={lineBreak}>
        <b>
          {/* Executed part (bought/sold tokens) */}
          <TokenAmount amount={filledAmountWithFee} token={mainToken} symbol={mainSymbol} />
        </b>{' '}
        {action}{' '}
        {touched && (
          // Executed part of the trade:
          //    Total buy tokens you receive (for sell orders)
          //    Total sell tokens you pay (for buy orders)
          <>
            for a total of{' '}
            <b>
              <TokenAmount amount={swappedAmountWithFee} token={swappedToken} symbol={swappedSymbol} />
            </b>
          </>
        )}
      </OrderAssetsInfoWrapper>
    </>
  )
  return !fullView ? (
    <Wrapper>
      <ProgressBar percentage={formattedPercentage} />
      <OrderAssetsInfo />
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
            <OrderAssetsInfo />
          </div>
          <ProgressBar showLabel={false} percentage={formattedPercentage} />
        </FilledContainer>
      </TableHeadingContent>
      <TableHeadingContent>
        <p className="title">Avg. Execution Price</p>
        <p className="priceNumber">
          {buyToken && sellToken && (
            <OrderPriceDisplay
              buyAmount={executedBuyAmount}
              buyToken={buyToken}
              sellAmount={executedSellAmount}
              sellToken={sellToken}
              showInvertButton
              isPriceInverted={isPriceInverted}
              invertPrice={invertPrice}
            />
          )}
        </p>
      </TableHeadingContent>
      <TableHeadingContent className="surplus">
        <p className="title">Total Surplus</p>
        <StyledSurplusComponent surplus={surplus} token={surplusToken} />
      </TableHeadingContent>
      <TableHeadingContent>
        <p className="title">Limit Price</p>
        <p className="priceNumber">
          {buyToken && sellToken && (
            <OrderPriceDisplay
              buyAmount={buyAmount}
              buyToken={buyToken}
              sellAmount={sellAmount}
              sellToken={sellToken}
              showInvertButton
              isPriceInverted={isPriceInverted}
              invertPrice={invertPrice}
            />
          )}
        </p>
      </TableHeadingContent>
    </TableHeading>
  )
}
