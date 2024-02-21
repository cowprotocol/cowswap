import { RowFixed } from '@cowprotocol/ui'
import { MouseoverTooltipContent } from '@cowprotocol/ui'

import { StyledRowBetween, TextWrapper } from 'modules/swap/pure/Row/styled'
import { RowStyleProps, RowWithShowHelpersProps } from 'modules/swap/pure/Row/types'
import { StyledInfoIcon } from 'modules/swap/pure/styled'

import { useSwapZeroFee } from 'common/hooks/featureFlags/useSwapZeroFee'
import { FiatRate } from 'common/pure/RateInfo'

export interface RowFeeContentProps extends RowWithShowHelpersProps {
  tooltip: string
  feeToken: string
  feeUsd?: string
  fullDisplayFee: string
  feeCurrencySymbol: string
  styleProps?: RowStyleProps
  noLabel?: boolean
  showFiatOnly?: boolean
}

export function RowFeeContent(props: RowFeeContentProps) {
  const swapZeroFee = useSwapZeroFee()
  const {
    showHelpers,
    tooltip,
    feeToken,
    feeUsd,
    fullDisplayFee,
    feeCurrencySymbol,
    noLabel,
    showFiatOnly,
    styleProps = {},
  } = props

  return (
    <StyledRowBetween {...styleProps} alignContentRight={showFiatOnly}>
      {!noLabel && (
        <RowFixed>
          <TextWrapper>{swapZeroFee ? 'Est. fees' : 'Fees'}</TextWrapper>
          {showHelpers && (
            <MouseoverTooltipContent content={tooltip} wrap>
              <StyledInfoIcon size={16} />
            </MouseoverTooltipContent>
          )}
        </RowFixed>
      )}

      {showFiatOnly ? (
        <TextWrapper title={feeToken}>{feeUsd ? feeUsd : feeToken}</TextWrapper>
      ) : (
        <TextWrapper title={`${fullDisplayFee} ${feeCurrencySymbol}`}>
          {feeToken} {feeUsd && <FiatRate>{feeUsd}</FiatRate>}
        </TextWrapper>
      )}
    </StyledRowBetween>
  )
}
