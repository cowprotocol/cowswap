import { RowFixed } from 'legacy/components/Row'
import { MouseoverTooltipContent } from 'legacy/components/Tooltip'
import { StyledInfoIcon } from 'modules/swap/pure/styled'
import { FiatRate } from 'common/pure/RateInfo/'
import { StyledRowBetween, TextWrapper } from 'modules/swap/pure/Row/styled'
import { RowStyleProps, RowWithShowHelpersProps } from 'modules/swap/pure/Row/types'

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
