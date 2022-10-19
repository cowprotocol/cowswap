import { ThemedText } from 'theme'

import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { StyledInfo } from '@cow/pages/Swap/styleds'
import { LightGreyText } from '@cow/modules/swap/pure/styled'
import { RowFeeProps } from '@cow/modules/swap/containers/RowFee'
import { RowCommonProps } from '../typings'

export type RowFeeAuxProps = RowCommonProps & {
  includeGasMessage: string
  tooltip: string
  feeToken: string
  feeUsd?: string
  fullDisplayFee: string
  feeCurrencySymbol: string
}

export function RowFeeContent(props: Omit<RowFeeProps, 'feeFiatValue' | 'allowsOffchainSigning'> & RowFeeAuxProps) {
  const {
    rowHeight,
    fontSize,
    fontWeight,
    showHelpers,
    theme,
    includeGasMessage,
    tooltip,
    feeToken,
    feeUsd,
    fullDisplayFee,
    feeCurrencySymbol,
  } = props
  return (
    <RowBetween height={rowHeight}>
      <RowFixed>
        <ThemedText.Black fontSize={fontSize} fontWeight={fontWeight} color={theme.text1}>
          Fees {includeGasMessage}
        </ThemedText.Black>
        {showHelpers && (
          <MouseoverTooltipContent content={tooltip} bgColor={theme.bg1} color={theme.text1} wrap>
            <StyledInfo />
          </MouseoverTooltipContent>
        )}
      </RowFixed>

      <ThemedText.Black fontSize={fontSize} color={theme.text1} title={`${fullDisplayFee} ${feeCurrencySymbol}`}>
        {feeToken} {feeUsd && <LightGreyText>{feeUsd}</LightGreyText>}
      </ThemedText.Black>
    </RowBetween>
  )
}
