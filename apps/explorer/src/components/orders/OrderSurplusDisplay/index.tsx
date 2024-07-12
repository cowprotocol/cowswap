import React, { useMemo } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { faArrowAltCircleUp as faIcon } from '@fortawesome/free-regular-svg-icons'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { SurplusComponent } from 'components/common/SurplusComponent'
import { TokenAmount } from 'components/token/TokenAmount'
import { BaseIconTooltipOnHover } from 'components/Tooltip'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components/macro'

import { Order } from 'api/operator'
// TODO: Enable once API is ready
// import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'

const Wrapper = styled.div``

// TODO: Enable once API is ready
// const fetchSurplusBreakdown = async (initialSurplus: React.ReactNode): Promise<any> => {
//   // TODO: Simulating API call to fetch surplus breakdown data
//   return new Promise((resolve) => {
//     resolve({
//       networkCosts: 'TODO: BIG NUMBER HERE ETH',
//       fee: 'TODO: FEE NUMBER HERE',
//       total: initialSurplus,
//     })
//   })
// }

// TODO: Enable once API is ready
// const renderSurplusBreakdown = (data: any): React.ReactNode => {
//   return (
//     <table>
//       <tbody>
//         <tr>
//           <td>Protected slippage:</td>
//           <td>{data.networkCosts}</td>
//         </tr>
//         <tr>
//           <td>Price improvement (user share):</td>
//           <td>{data.fee}</td>
//         </tr>
//         <tr>
//           <td>Total surplus:</td>
//           <td>{data.total}</td>
//         </tr>
//       </tbody>
//     </table>
//   )
// }

export type Props = { order: Order; amountSmartFormatting?: boolean } & React.HTMLAttributes<HTMLDivElement>
type OrderSurplus = { amount: BigNumber; percentage: BigNumber; surplusToken: TokenErc20 }

function useGetSurplus(order: Order): OrderSurplus | null {
  const { kind, buyToken, sellToken, surplusAmount, surplusPercentage } = order

  const surplusToken = isSellOrder(kind) ? buyToken : sellToken

  return useMemo(() => {
    if (!surplusToken || surplusAmount.isZero()) {
      return null
    }

    return { amount: surplusAmount, percentage: surplusPercentage, surplusToken }
  }, [surplusToken, surplusAmount, surplusPercentage])
}

export function OrderSurplusDisplay(props: Props): React.ReactNode | null {
  const surplus = useGetSurplus(props.order)

  if (!surplus) return null

  const SurplusElement = <SurplusComponent surplus={surplus} token={surplus.surplusToken} icon={faIcon} />

  return (
    <Wrapper>
      {SurplusElement}
      {/*TODO: Enable once API is ready*/}
      {/*<NumbersBreakdown*/}
      {/*  fetchData={() => fetchSurplusBreakdown(SurplusElement)}*/}
      {/*  renderContent={renderSurplusBreakdown}*/}
      {/*/>*/}
    </Wrapper>
  )
}

const HiddenSection = styled.span<{ showHiddenSection: boolean; stretchHiddenSection?: boolean }>`
  display: ${({ showHiddenSection }): string => (showHiddenSection ? 'flex' : 'none')};
  ${({ stretchHiddenSection }): FlattenSimpleInterpolation | false | undefined =>
    stretchHiddenSection &&
    css`
      width: 3.4rem;
      display: inline-block;
      justify-content: flex-start;
    `}
`

export function OrderSurplusTooltipDisplay({
  order,
  defaultWhenNoSurplus,
  stretchWhenNoSurplus = false,
}: Props & {
  showHiddenSection?: boolean
  defaultWhenNoSurplus?: string
  stretchWhenNoSurplus?: boolean
}): React.ReactNode {
  const surplus = useGetSurplus(order)

  if (!surplus)
    return (
      <HiddenSection showHiddenSection stretchHiddenSection={stretchWhenNoSurplus}>
        {defaultWhenNoSurplus}
      </HiddenSection>
    )

  return (
    <BaseIconTooltipOnHover
      tooltip={<TokenAmount amount={surplus.amount} token={surplus.surplusToken} />}
      targetContent={<SurplusComponent surplus={surplus} token={surplus.surplusToken} icon={faIcon} />}
    />
  )
}
