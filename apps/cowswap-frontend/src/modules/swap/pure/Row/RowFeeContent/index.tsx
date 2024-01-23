import { RowFixed } from '@cowprotocol/ui'
import { MouseoverTooltipContent } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { StyledRowBetween, TextWrapper } from 'modules/swap/pure/Row/styled'
import { RowStyleProps, RowWithShowHelpersProps } from 'modules/swap/pure/Row/types'
import { StyledInfoIcon } from 'modules/swap/pure/styled'

import { FeatureGuard } from 'common/containers/FeatureGuard'
import { FiatRate } from 'common/pure/RateInfo'

const FiatOnlyFee = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  font-size: inherit;
`

export interface RowFeeContentProps extends RowWithShowHelpersProps {
  includeGasMessage: string
  tooltip: string
  feeToken: string
  feeUsd?: string
  fullDisplayFee: string
  feeCurrencySymbol: string
  styleProps?: RowStyleProps
  showLabel: boolean
  showFiatOnly: boolean
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
    showLabel = true,
    showFiatOnly = false,
  } = props

  // If showFiatOnly is true, return only the fiat value
  if (showFiatOnly) {
    return (
      <FiatOnlyFee
        title={`${fullDisplayFee} ${feeCurrencySymbol}`}
        className="styled__TextWrapper-sc-j2s9gf-1 css-vurnku"
      >
        {feeUsd ? <FiatRate>{feeUsd}</FiatRate> : feeToken}
      </FiatOnlyFee>
    )
  }

  // Rest of the component for when showFiatOnly is false
  const feeDisplayValue = (
    <>
      {feeToken} {feeUsd && <FiatRate>{feeUsd}</FiatRate>}
    </>
  )

  return (
    <StyledRowBetween {...styleProps}>
      {showLabel && (
        <RowFixed>
          <TextWrapper>
            <FeatureGuard featureFlag="swapZeroFee" defaultContent="Fees">
              Est. fees
            </FeatureGuard>
            {includeGasMessage}
          </TextWrapper>
          {showHelpers && (
            <MouseoverTooltipContent content={tooltip} wrap>
              <StyledInfoIcon size={16} />
            </MouseoverTooltipContent>
          )}
        </RowFixed>
      )}

      <TextWrapper title={`${fullDisplayFee} ${feeCurrencySymbol}`}>{feeDisplayValue}</TextWrapper>
    </StyledRowBetween>
  )
}
