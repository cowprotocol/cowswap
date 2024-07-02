import React from 'react'

import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { TokenAmount } from 'components/token/TokenAmount'
import { MAX_SURPLUS_PERCENTAGE } from 'const'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components/macro'
import { formatPercentage, Surplus } from 'utils'

const IconWrapper = styled(FontAwesomeIcon)`
  padding: 0 0.5rem 0 0;
  margin: 0;
  box-sizing: content-box;

  :hover {
    cursor: pointer;
  }
`

export const Percentage = styled.span`
  color: ${({ theme }): string => theme.green};
`

export const Amount = styled.span<{ showHiddenSection: boolean; strechHiddenSection?: boolean }>`
  display: ${({ showHiddenSection }): string => (showHiddenSection ? 'flex' : 'none')};
  ${({ strechHiddenSection }): FlattenSimpleInterpolation | false | undefined =>
    strechHiddenSection &&
    css`
      width: 3.4rem;
      display: inline-block;
      justify-content: end;
    `}
`

const Wrapper = styled.span`
  display: flex;
  align-items: center;
`

export type SurplusComponentProps = {
  surplus: Surplus | null
  token: TokenErc20 | null
  showHidden?: boolean
  className?: string
  icon?: IconDefinition
  iconColor?: string
}

export const SurplusComponent: React.FC<SurplusComponentProps> = (props) => {
  const { surplus, token, showHidden, className, icon, iconColor } = props

  if (!surplus || !token) {
    return null
  }

  const { percentage, amount } = surplus

  const showPercentage = percentage.lt(MAX_SURPLUS_PERCENTAGE)

  const amountDisplay = (
    <Amount showHiddenSection={!!showHidden || !showPercentage}>
      <TokenAmount amount={amount} token={token} />
    </Amount>
  )

  return (
    <Wrapper className={className}>
      {icon && <IconWrapper icon={icon} color={iconColor} />}
      <Percentage>{showPercentage ? formatPercentage(percentage) : amountDisplay}</Percentage> &nbsp;
      {showPercentage && amountDisplay}
    </Wrapper>
  )
}
