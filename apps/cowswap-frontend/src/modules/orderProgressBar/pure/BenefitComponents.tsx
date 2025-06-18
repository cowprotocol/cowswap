import { ReactNode } from 'react'

import { Textfit } from 'react-textfit'

import * as styledEl from './styled'

import { truncateWithEllipsis } from '../helpers'
import { OrderProgressBarProps } from '../types'

export function ShowSurplus({
  order,
  shouldShowSurplus,
  surplusPercentValue,
}: {
  order: OrderProgressBarProps['order']
  shouldShowSurplus: boolean | undefined | null
  surplusPercentValue: string
}): ReactNode {
  return (
    <styledEl.BenefitSurplusContainer>
      I just received surplus on
      <styledEl.TokenPairTitle title={`${order?.inputToken.symbol} / ${order?.outputToken.symbol}`}>
        {truncateWithEllipsis(`${order?.inputToken.symbol} / ${order?.outputToken.symbol}`, 30)}
      </styledEl.TokenPairTitle>{' '}
      <styledEl.Surplus>
        <Textfit
          mode="multi"
          min={14}
          max={60}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            lineHeight: 1.2,
          }}
        >
          {shouldShowSurplus && surplusPercentValue !== 'N/A' ? `+${surplusPercentValue}%` : 'N/A'}
        </Textfit>
      </styledEl.Surplus>
    </styledEl.BenefitSurplusContainer>
  )
}

export function NoSurplus({ randomBenefit }: { randomBenefit: string }): ReactNode {
  return (
    <styledEl.BenefitSurplusContainer>
      <styledEl.BenefitTagLine>Did you know?</styledEl.BenefitTagLine>
      <styledEl.BenefitText>
        <Textfit
          mode="multi"
          min={12}
          max={50}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            lineHeight: 1.2,
          }}
        >
          {randomBenefit}
        </Textfit>
      </styledEl.BenefitText>
    </styledEl.BenefitSurplusContainer>
  )
}