import React, { ReactNode } from 'react'

import styled from 'styled-components/macro'

import { FilledProgressContext } from './useFilledProgressContext'

import { TokenAmount } from '../../token/TokenAmount'

const OrderAssetsInfoWrapper = styled.span<{ lineBreak?: boolean }>`
  font-size: 1.2rem;
  line-height: normal;

  b:first-child {
    display: ${({ lineBreak }): string => (lineBreak ? 'block' : 'inline')};
  }
`

interface OrderAssetsInfoProps {
  lineBreak: boolean | undefined
  context: FilledProgressContext
}

export function OrderAssetsInfo({ lineBreak, context }: OrderAssetsInfoProps): ReactNode {
  const {
    filledAmountWithFee,
    swappedAmountWithFee,
    swappedToken,
    swappedSymbol,
    mainSymbol,
    mainToken,
    action,
    touched,
  } = context

  return (
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
}
