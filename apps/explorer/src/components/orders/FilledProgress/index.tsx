import React from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'

import { ProgressBar } from 'components/common/ProgressBar'
import { Amount, Percentage, SurplusComponent } from 'components/common/SurplusComponent'
import { TokenAmount } from 'components/token/TokenAmount'
import styled from 'styled-components/macro'
import { media } from 'theme/styles/media'
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
  gap: 1rem;
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }): string => theme.textPrimary1};

  > span {
    margin: 0 0 0 2rem;
    font-weight: ${({ theme }): string => theme.fontLighter};

    ${media.mobile} {
      line-height: 1.5;
    }
  }

  > span > b {
    font-weight: ${({ theme }): string => theme.fontMedium};
  }

  > div {
    ${media.mobile} {
      max-width: 150px;
    }
  }
`

const TableHeading = styled.div`
  padding: 0 0 1rem;
  display: grid;
  grid-template-columns: minmax(min-content, auto) auto auto auto;
  grid-template-rows: max-content;
  justify-content: flex-start;
  gap: 1.6rem;

  ${media.mobile} {
    display: flex;
    flex-flow: column wrap;
  }

  .title {
    text-transform: uppercase;
    font-weight: normal;
    font-size: 1.1rem;
    letter-spacing: 0.1rem;
    color: ${({ theme }): string => theme.grey};
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
    color: ${({ theme }): string => theme.green};

    ${media.mobile} {
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

    ${media.mobile} {
      font-size: 1.8rem;
    }

    > span {
      line-height: 1.2;
      flex-flow: row wrap;
      color: ${({ theme }): string => theme.grey};
    }

    > span > span:first-child {
      color: ${({ theme }): string => theme.textPrimary1};
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
  background: ${({ theme }): string => theme.tableRowBorder};
  padding: 2rem 1.8rem;

  ${media.mobile} {
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

export function FilledProgress(props: Props): JSX.Element {
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
  const formattedPercentage = filledPercentage.times('100').decimalPlaces(2).toString()

  const surplus = { amount: surplusAmount, percentage: surplusPercentage }
  const surplusToken = (isSell ? buyToken : sellToken) || null

  const OrderAssetsInfo = (): JSX.Element => (
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
            <p className="percentage">{formattedPercentage}%</p>
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
        <StyledSurplusComponent surplus={surplus} token={surplusToken} showHidden />
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
