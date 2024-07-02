import React from 'react'

import { ZERO_BIG_NUMBER } from 'const'
import styled from 'styled-components/macro'
import { formatSmartMaxPrecision, safeTokenName } from 'utils'

import { Order } from 'api/operator'

const Wrapper = styled.div`
  & > span {
    margin: 0 0.5rem 0 0;
  }
`

// const UsdAmount = styled.span`
//   color: ${({ theme }): string => theme.grey};
// `

export type Props = { order: Order }

export function GasFeeDisplay(props: Props): JSX.Element | null {
  const {
    order: { feeAmount, sellToken, sellTokenAddress, fullyFilled, totalFee },
  } = props

  // TODO: fetch amount in USD
  // const executedFeeUSD = '0.99'
  // const totalFeeUSD = '0.35'

  // When `sellToken` is not set, default to raw amounts
  let formattedExecutedFee: string = totalFee.toString(10)
  let formattedTotalFee: string = feeAmount.toString(10)
  // When `sellToken` is not set, show token address
  let quoteSymbol: string = sellTokenAddress

  if (sellToken) {
    formattedExecutedFee = formatSmartMaxPrecision(totalFee, sellToken)
    formattedTotalFee = formatSmartMaxPrecision(feeAmount, sellToken)

    quoteSymbol = safeTokenName(sellToken)
  }

  // In case: the order hasn't had any fills OR it had but the fee hasn't been reported yet in the API
  const noFee = feeAmount.isZero() && totalFee.isZero()

  return (
    <Wrapper>
      <span>{noFee ? '-' : `${formattedExecutedFee} ${quoteSymbol}`}</span>
      {/* <UsdAmount>(~${totalFeeUSD})</UsdAmount> */}
      {!fullyFilled && feeAmount.gt(ZERO_BIG_NUMBER) && (
        <>
          <span>
            of {formattedTotalFee} {quoteSymbol}
          </span>
          {/* <UsdAmount>(~${executedFeeUSD})</UsdAmount> */}
        </>
      )}
    </Wrapper>
  )
}
