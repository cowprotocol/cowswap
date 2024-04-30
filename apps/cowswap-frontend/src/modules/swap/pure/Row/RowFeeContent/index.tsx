import { ReactNode } from 'react'

import { RowFixed } from '@cowprotocol/ui'
import { HoverTooltip } from '@cowprotocol/ui'

import { StyledRowBetween, TextWrapper } from 'modules/swap/pure/Row/styled'
import { RowStyleProps } from 'modules/swap/pure/Row/types'
import { StyledInfoIcon } from 'modules/swap/pure/styled'

import { FiatRate } from 'common/pure/RateInfo'

export interface RowFeeContentProps {
  label: string
  tooltip: ReactNode
  feeToken: ReactNode
  feeUsd?: string
  fullDisplayFee: string
  feeCurrencySymbol: string
  styleProps?: RowStyleProps
  noLabel?: boolean
  isFree: boolean
}

export function RowFeeContent(props: RowFeeContentProps) {
  const {
    label,
    tooltip,
    isFree,
    feeToken,
    feeUsd,
    fullDisplayFee,
    feeCurrencySymbol,
    noLabel,
    styleProps = {},
  } = props

  return (
    <StyledRowBetween {...styleProps}>
      {!noLabel && (
        <RowFixed>
          <TextWrapper>{label}</TextWrapper>
          <HoverTooltip content={tooltip} wrapInContainer>
            <StyledInfoIcon size={16} />
          </HoverTooltip>
        </RowFixed>
      )}

      <TextWrapper title={`${fullDisplayFee} ${feeCurrencySymbol}`} success={isFree}>
        {feeToken} {feeUsd && <FiatRate>{feeUsd}</FiatRate>}
      </TextWrapper>
    </StyledRowBetween>
  )
}
