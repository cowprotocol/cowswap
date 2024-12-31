import { useMemo } from 'react'

import { Nullish } from '@cowprotocol/ui'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'
import { ZERO_BIG_NUMBER } from 'const'
import styled from 'styled-components/macro'
import { formatSmartMaxPrecision, safeTokenName } from 'utils'

import { Order } from 'api/operator'

const Wrapper = styled.div`
  > span {
    margin: 0 0.5rem 0 0;
  }
`

export type Props = { order: Order }

export function GasFeeDisplay({ order }: Props): React.ReactNode | null {
  const { feeAmount, totalFee, fullyFilled } = order

  const { quoteSymbol, formattedNetworkCosts, formattedProtocolFees, formattedExecutedFee, formattedTotalFee } =
    useMemo(() => getFeeDisplayAmounts(order), [order])

  const noFee = feeAmount.isZero() && totalFee.isZero()

  const FeeElement = (
    <span>
      {noFee ? '-' : `${formattedExecutedFee} ${quoteSymbol}`}
      {!fullyFilled && feeAmount.gt(ZERO_BIG_NUMBER) && (
        <>
          <span>
            of {formattedTotalFee} {quoteSymbol}
          </span>
        </>
      )}
    </span>
  )

  return (
    <Wrapper>
      {FeeElement}
      <NumbersBreakdown>
        <table>
          <tbody>
            {formattedNetworkCosts && (
              <tr>
                <td>Network Costs:</td>
                <td>{formattedNetworkCosts}</td>
              </tr>
            )}
            {formattedProtocolFees && (
              <tr>
                <td>Fee:</td>
                <td>{formattedProtocolFees}</td>
              </tr>
            )}
            <tr>
              <td>Total Costs & Fees:</td>
              <td>{formattedExecutedFee}</td>
            </tr>
          </tbody>
        </table>
      </NumbersBreakdown>
    </Wrapper>
  )
}

function getFeeToken(order: Order) {
  const { sellToken, buyToken } = order
  const { executedFeeToken } = order
  if (sellToken?.address.toLowerCase() === executedFeeToken?.toLowerCase()) {
    return sellToken
  }
  if (buyToken?.address.toLowerCase() === executedFeeToken?.toLowerCase()) {
    return buyToken
  }
  return undefined
}

function getFeeDisplayAmounts(order: Order) {
  const { networkCosts, protocolFees, totalFee, executedFeeToken, feeAmount } = order

  const feeToken = getFeeToken(order)

  const quoteSymbol = feeToken ? safeTokenName(feeToken) : executedFeeToken
  const formattedNetworkCosts = getFormattedAmount(networkCosts || ZERO_BIG_NUMBER, feeToken)
  const formattedProtocolFees = getFormattedAmount(protocolFees || ZERO_BIG_NUMBER, feeToken)
  const formattedExecutedFee = getFormattedAmount(totalFee, feeToken)
  const formattedTotalFee = getFormattedAmount(feeAmount, feeToken)
  //
  // // When these 2 are set, for sure we have new style fees
  // if (networkCosts || protocolFees) {
  //   if (isSell) {
  //     quoteSymbol = feeToken ? safeTokenName(feeToken) : executedFeeToken
  //     formattedNetworkCosts = getFormattedAmount(networkCosts || ZERO_BIG_NUMBER, feeToken)
  //     formattedProtocolFees = getFormattedAmount(protocolFees || ZERO_BIG_NUMBER, feeToken)
  //     formattedExecutedFee = getFormattedAmount(totalFee, feeToken)
  //     formattedTotalFee = getFormattedAmount(feeAmount, feeToken)
  //   } else {
  //     quoteSymbol = feeToken ? safeTokenName(feeToken) : executedFeeToken
  //     formattedNetworkCosts = getFormattedAmount(networkCosts || ZERO_BIG_NUMBER, feeToken)
  //     formattedProtocolFees = getFormattedAmount(protocolFees || ZERO_BIG_NUMBER, feeToken)
  //     formattedExecutedFee = getFormattedAmount(totalFee, feeToken)
  //     formattedTotalFee = getFormattedAmount(feeAmount, feeToken)
  //   }
  // } else {
  //   // Otherwise, it can have no fees OR be old style fees, without the policies
  //   // TODO: handle old and new styles, as the fee token will vary! (always sell for old vs surplus token for new)
  //   quoteSymbol = sellToken ? safeTokenName(sellToken) : sellTokenAddress
  //   formattedNetworkCosts = ''
  //   formattedProtocolFees = ''
  //   formattedExecutedFee = getFormattedAmount(totalFee, sellToken)
  //   formattedTotalFee = getFormattedAmount(feeAmount, sellToken)
  // }

  return {
    quoteSymbol,
    formattedNetworkCosts,
    formattedProtocolFees,
    formattedExecutedFee,
    formattedTotalFee,
  }
}

function getFormattedAmount(amount: BigNumber, token: Nullish<TokenErc20>): string {
  return token ? formatSmartMaxPrecision(amount, token) : amount.toString(10)
}
