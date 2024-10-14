import { HoverTooltip } from '@cowprotocol/ui'

import { AlertTriangle } from 'react-feather'

import { LOW_TIER_FEE } from '../HighFeeWarning/consts'
import { ErrorStyledInfoIcon, WarningContainer } from '../HighFeeWarning/styled'

export type HighSuggestedSlippageWarningProps = {
  isSuggestedSlippage: boolean | undefined
  slippageBps: number | undefined
  className?: string
}

export function HighSuggestedSlippageWarning(props: HighSuggestedSlippageWarningProps) {
  const { isSuggestedSlippage, slippageBps, ...rest } = props

  if (!isSuggestedSlippage || !slippageBps || slippageBps <= 200) {
    return null
  }

  return (
    <WarningContainer {...rest} level={LOW_TIER_FEE}>
      <div>
        <AlertTriangle size={24} />
        Beware! High dynamic slippage suggested ({`${slippageBps / 100}`}%)
        <HoverTooltip wrapInContainer content={"It's not thaaat bad. Just to make sure you noticed 😉"}>
          <ErrorStyledInfoIcon />
        </HoverTooltip>
      </div>
    </WarningContainer>
  )
}
