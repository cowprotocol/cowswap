// TODO: Enable once API is ready
// import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'

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

  let formattedExecutedFee: string = totalFee.toString(10)
  let formattedTotalFee: string = feeAmount.toString(10)
  let quoteSymbol: string = sellTokenAddress

  if (sellToken) {
    formattedExecutedFee = formatSmartMaxPrecision(totalFee, sellToken)
    formattedTotalFee = formatSmartMaxPrecision(feeAmount, sellToken)

    quoteSymbol = safeTokenName(sellToken)
  }

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
      {/*TODO: Enable once API is ready*/}
      {/*<NumbersBreakdown*/}
      {/*  fetchData={() => fetchFeeBreakdown(`${formattedExecutedFee} ${quoteSymbol}`)}*/}
      {/*  renderContent={renderFeeBreakdown}*/}
      {/*/>*/}
    </Wrapper>
  )
}
