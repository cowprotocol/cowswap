import React, { useMemo } from 'react'

import { AddressKey, areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'
import { ZERO_BIG_NUMBER } from 'const'
import styled from 'styled-components/macro'

import { Order } from 'api/operator'
import { formatTokenAmount } from 'utils/tokenFormatting'

const Wrapper = styled.div`
  > span {
    margin: 0 0.5rem 0 0;
  }
`

export type Props = { order: Order }

export function GasFeeDisplay(props: Props): React.ReactNode | null {
  const { order } = props
  const {
    feeAmount,
    sellToken,
    sellTokenAddress,
    fullyFilled,
    totalFee,
    networkCosts,
    protocolFees,
    protocolFeeTokenAddress,
    executedFeeToken,
  } = order

  const { executedFeeFormatted, totalFeeFormatted, quoteSymbol } = useMemo(() => {
    if (!sellToken) {
      return {
        executedFeeFormatted: totalFee.toString(10),
        totalFeeFormatted: feeAmount.toString(10),
        quoteSymbol: sellTokenAddress,
      }
    }

    const { formattedAmount: executedFeeFormatted } = formatTokenAmount(totalFee, sellToken)
    const { formattedAmount: totalFeeFormatted, symbol: quoteSymbol } = formatTokenAmount(feeAmount, sellToken)

    return { executedFeeFormatted, totalFeeFormatted, quoteSymbol }
  }, [totalFee, feeAmount, sellToken, sellTokenAddress])

  const noFee = useMemo(() => feeAmount.isZero() && totalFee.isZero(), [feeAmount, totalFee])

  const FeeElement = useMemo(
    () => (
      <span>
        {noFee ? '-' : `${executedFeeFormatted} ${quoteSymbol}`}
        {!fullyFilled && feeAmount.gt(ZERO_BIG_NUMBER) && (
          <>
            <span>
              of {totalFeeFormatted} {quoteSymbol}
            </span>
          </>
        )}
      </span>
    ),
    [noFee, executedFeeFormatted, quoteSymbol, fullyFilled, feeAmount, totalFeeFormatted],
  )

  const executedFeeTokenKey = executedFeeToken ? getAddressKey(executedFeeToken) : undefined
  const sameDenomination = areAddressesEqual(executedFeeTokenKey, protocolFeeTokenAddress)

  return (
    <Wrapper>
      {FeeElement}
      {networkCosts && protocolFees && (
        <NumbersBreakdown>
          <table>
            <tbody>
              <tr>
                <td>Network Costs:</td>
                <td>{formatFee(order, networkCosts, executedFeeTokenKey)}</td>
              </tr>
              <tr>
                <td>Fee:</td>
                <td>{formatFee(order, protocolFees, protocolFeeTokenAddress)}</td>
              </tr>
              {sameDenomination && (
                <tr>
                  <td>Total Costs &amp; Fees:</td>
                  <td>
                    {executedFeeFormatted} {quoteSymbol}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </NumbersBreakdown>
      )}
    </Wrapper>
  )
}

function formatFee(order: Order, amount: BigNumber, address: AddressKey | undefined): string {
  const token = resolveToken(order, address)
  if (!token) return address ? `${amount.toString(10)} ${address}` : amount.toString(10)
  const { formattedAmount, symbol } = formatTokenAmount(amount, token)
  return `${formattedAmount} ${symbol}`
}

function resolveToken(order: Order, address: AddressKey | undefined): TokenErc20 | undefined {
  if (!address) return order.sellToken || undefined
  if (areAddressesEqual(order.sellToken?.address, address)) return order.sellToken || undefined
  if (areAddressesEqual(order.buyToken?.address, address)) return order.buyToken || undefined
  return undefined
}
