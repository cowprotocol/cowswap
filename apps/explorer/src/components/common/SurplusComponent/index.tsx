import React from 'react'

import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { TokenAmount } from 'components/token/TokenAmount'
import { MAX_SURPLUS_PERCENTAGE } from 'const'
import styled, { useTheme } from 'styled-components/macro'
import { formatPercentage, Surplus } from 'utils'

const IconWrapper = styled(FontAwesomeIcon)`
  padding: 0 0.5rem 0 0;
  margin: 0;
  box-sizing: content-box;

  &:hover {
    cursor: pointer;
  }
`

export const Percentage = styled.span`
  color: ${({ theme }): string => theme.green};
`

export const Amount = styled.span`
  margin: 0 0.5rem 0 0;
`

const Wrapper = styled.span``

export type SurplusComponentProps = {
  surplus: Surplus | null
  token: TokenErc20 | null
  className?: string
  icon?: IconDefinition
  iconColor?: string
}

export const SurplusComponent: React.FC<SurplusComponentProps> = (props) => {
  const theme = useTheme()
  const { surplus, token, className, icon, iconColor = theme.green } = props

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
