import React from 'react'

import { Nullish } from '@cowprotocol/types'
import { Color } from '@cowprotocol/ui'

import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { TokenAmount } from 'components/token/TokenAmount'
import { MAX_SURPLUS_PERCENTAGE } from 'const'
import { formatPercentage, Surplus } from 'utils'

import { Wrapper, IconWrapper, Percentage, Amount } from './styled'

export { Amount, Percentage } from './styled'

export type SurplusComponentProps = {
  surplus: Surplus | null
  token: Nullish<TokenErc20>
  className?: string
  icon?: IconDefinition
  iconColor?: string
}

export const SurplusComponent: React.FC<SurplusComponentProps> = (props) => {
  const { surplus, token, className, icon, iconColor = Color.explorer_green } = props

  if (!surplus || !token) {
    return null
  }

  const { percentage, amount } = surplus

  const showPercentage = percentage.lt(MAX_SURPLUS_PERCENTAGE)

  const amountDisplay = (
    <Amount>
      <TokenAmount amount={amount} token={token} />
    </Amount>
  )

  return (
    <Wrapper className={className}>
      {icon && <IconWrapper icon={icon} color={iconColor} />}
      <Percentage>{showPercentage ? formatPercentage(percentage) : amountDisplay}</Percentage>&nbsp;
      {showPercentage && amountDisplay}
    </Wrapper>
  )
}
