import React from 'react'
import styled, { css, FlattenSimpleInterpolation, useTheme } from 'styled-components'

import { Order } from 'api/operator'

import { BaseIconTooltipOnHover } from 'components/Tooltip'
import { faArrowAltCircleUp as faIcon } from '@fortawesome/free-regular-svg-icons'
import BigNumber from 'bignumber.js'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { SurplusComponent } from 'components/common/SurplusComponent'
import { TokenAmount } from 'components/token/TokenAmount'
import { isSellOrder } from '@cowprotocol/common-utils'

const Wrapper = styled(SurplusComponent)`
  display: flex;
  & > * {
    margin-right: 0.25rem;
  }

  & > :last-child {
    margin-right: 0;
  }
`

// const UsdAmount = styled.span`
//   color: ${({ theme }): string => theme.textPrimary1};
//   opacity: 0.5;
// `

export type Props = { order: Order; amountSmartFormatting?: boolean } & React.HTMLAttributes<HTMLDivElement>
type OrderSurplus = { amount: BigNumber; percentage: BigNumber; surplusToken: TokenErc20 }

function useGetSurplus(order: Order): OrderSurplus | null {
  const { kind, buyToken, sellToken, surplusAmount, surplusPercentage } = order

  const surplusToken = isSellOrder(kind) ? buyToken : sellToken

  // TODO: get USD estimation
  // const usdAmount = '55.555'

  if (!surplusToken || surplusAmount.isZero()) {
    return null
  }

  return { amount: surplusAmount, percentage: surplusPercentage, surplusToken }
}

export function OrderSurplusDisplay(props: Props): JSX.Element | null {
  const surplus = useGetSurplus(props.order)

  if (!surplus) return null

  return <Wrapper surplus={surplus} token={surplus.surplusToken} showHidden />
}

const HiddenSection = styled.span<{ showHiddenSection: boolean; strechHiddenSection?: boolean }>`
  display: ${({ showHiddenSection }): string => (showHiddenSection ? 'flex' : 'none')};
  ${({ strechHiddenSection }): FlattenSimpleInterpolation | false | undefined =>
    strechHiddenSection &&
    css`
      width: 3.4rem;
      display: inline-block;
      justify-content: end;
    `}
`

export function OrderSurplusTooltipDisplay({
  order,
  showHiddenSection = false,
  defaultWhenNoSurplus,
  strechWhenNoSurplus = false,
}: Props & {
  showHiddenSection?: boolean
  defaultWhenNoSurplus?: string
  strechWhenNoSurplus?: boolean
}): JSX.Element {
  const surplus = useGetSurplus(order)
  const theme = useTheme()

  if (!surplus)
    return (
      <HiddenSection showHiddenSection strechHiddenSection={strechWhenNoSurplus}>
        {defaultWhenNoSurplus}
      </HiddenSection>
    )

  return (
    <BaseIconTooltipOnHover
      tooltip={<TokenAmount amount={surplus.amount} token={surplus.surplusToken} />}
      targetContent={
        <SurplusComponent
          surplus={surplus}
          token={surplus.surplusToken}
          showHidden={showHiddenSection}
          icon={faIcon}
          iconColor={theme.green}
        />
      }
    />
  )
}
