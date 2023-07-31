import { RowFixed } from '../../../../../legacy/components/Row'
import { MouseoverTooltipContent } from '../../../../../legacy/components/Tooltip'

import { StyledRowBetween, TextWrapper } from '../styled'
import { RowStyleProps, RowWithShowHelpersProps } from '../types'
import { StyledInfoIcon } from '../../styled'

import { FiatRate } from '../../../../../common/pure/RateInfo'

export interface RowFeeContentProps extends RowWithShowHelpersProps {
  includeGasMessage: string
  tooltip: string
  feeToken: string
  feeUsd?: string
  fullDisplayFee: string
  feeCurrencySymbol: string
  styleProps?: RowStyleProps
}

export function RowFeeContent(props: RowFeeContentProps) {
  const {
    showHelpers,
    includeGasMessage,
    tooltip,
    feeToken,
    feeUsd,
    fullDisplayFee,
    feeCurrencySymbol,
    styleProps = {},
  } = props
  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>Fees {includeGasMessage}</TextWrapper>
        {showHelpers && (
          <MouseoverTooltipContent content={tooltip} wrap>
            <StyledInfoIcon size={16} />
          </MouseoverTooltipContent>
        )}
      </RowFixed>

      <TextWrapper title={`${fullDisplayFee} ${feeCurrencySymbol}`}>
        {feeToken} {feeUsd && <FiatRate>{feeUsd}</FiatRate>}
      </TextWrapper>
    </StyledRowBetween>
  )
}
