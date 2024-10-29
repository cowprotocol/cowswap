// TODO: Enable once API is ready
// import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'

import { useMemo } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/ui'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from 'const'
import styled from 'styled-components/macro'
import { formatSmartMaxPrecision, safeTokenName } from 'utils'

import { Order } from 'api/operator'

import { NumbersBreakdown } from '../NumbersBreakdown'

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

function getFeeDisplayAmounts(order: Order) {
  const {
    kind,
    networkCosts,
    protocolFees,
    sellToken,
    sellTokenAddress,
    buyToken,
    buyTokenAddress,
    totalFee,
    feeAmount,
  } = order

  const isSell = isSellOrder(kind)

  let quoteSymbol = ''
  let formattedNetworkCosts = ''
  let formattedProtocolFees = ''
  let formattedExecutedFee = ''
  let formattedTotalFee = ''

  // When these 2 are set, for sure we have new style fees
  if (networkCosts || protocolFees) {
    if (isSell) {
      quoteSymbol = buyToken ? safeTokenName(buyToken) : buyTokenAddress
      formattedNetworkCosts = getFormattedAmount(networkCosts || ZERO_BIG_NUMBER, buyToken)
      formattedProtocolFees = getFormattedAmount(protocolFees || ZERO_BIG_NUMBER, buyToken)
      formattedExecutedFee = getFormattedAmount(totalFee, buyToken)
      formattedTotalFee = getFormattedAmount(feeAmount, buyToken)
    } else {
      quoteSymbol = sellToken ? safeTokenName(sellToken) : sellTokenAddress
      formattedNetworkCosts = getFormattedAmount(networkCosts || ZERO_BIG_NUMBER, sellToken)
      formattedProtocolFees = getFormattedAmount(protocolFees || ZERO_BIG_NUMBER, sellToken)
      formattedExecutedFee = getFormattedAmount(totalFee, sellToken)
      formattedTotalFee = getFormattedAmount(feeAmount, sellToken)
    }
  } else {
    // Otherwise, it can have no fees OR be old style fees, without the policies
    // TODO: handle old and new styles, as the fee token will vary! (always sell for old vs surplus token for new)
    quoteSymbol = sellToken ? safeTokenName(sellToken) : sellTokenAddress
    formattedNetworkCosts = ''
    formattedProtocolFees = ''
    formattedExecutedFee = getFormattedAmount(totalFee, sellToken)
    formattedTotalFee = getFormattedAmount(feeAmount, sellToken)
  }

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
