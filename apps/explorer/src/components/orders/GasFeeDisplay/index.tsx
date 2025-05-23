// TODO: Enable once API is ready
// import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'

import React, { useMemo } from 'react'

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

// TODO: Enable once API is ready
// const fetchFeeBreakdown = async (initialFee: string): Promise<any> => {
//   // TODO: Simulating API call to fetch fee breakdown data
//   return new Promise((resolve) => {
//     resolve({
//       networkCosts: 'TODO: Get network costs here',
//       fee: 'TODO: Get fee here',
//       total: initialFee,
//     })
//   })
// }

// TODO: Enable once API is ready
// const renderFeeBreakdown = (data: any): React.ReactNode => {
//   return (
//     <table>
//       <tbody>
//         <tr>
//           <td>Network Costs:</td>
//           <td>{data.networkCosts}</td>
//         </tr>
//         <tr>
//           <td>Fee:</td>
//           <td>{data.fee}</td>
//         </tr>
//         <tr>
//           <td>Total Costs & Fees:</td>
//           <td>{data.total}</td>
//         </tr>
//       </tbody>
//     </table>
//   )
// }

export function GasFeeDisplay(props: Props): React.ReactNode | null {
  const {
    order: { feeAmount, sellToken, sellTokenAddress, fullyFilled, totalFee },
  } = props

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

  return (
    <Wrapper>
      {FeeElement}
      {/*TODO: Enable once API is ready*/}
      {/*<NumbersBreakdown*/}
      {/*  fetchData={() => fetchFeeBreakdown(`${formattedExecutedFee} ${quoteSymbol}`)}*/}
      {/*  renderContent={renderFeeBreakdown}*/}
      {/*/>*/}
    </Wrapper>
  )
}
