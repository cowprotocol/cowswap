import { ReactNode } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { swapStatusIcons } from 'modules/bridge/pure/StopStatus'
import { SwapAndBridgeStatus } from 'modules/bridge/types'

import * as styledEl from './styled'

import { BridgingFlowStep } from '../../types'

const TOKEN_LOGO_SIZE = 46

const titles: Record<BridgingFlowStep, MessageDescriptor> = {
  bridgingInProgress: msg`Bridging to destination...`,
  bridgingFailed: msg`Bridging failed. Refund started...`,
  bridgingFinished: msg`Bridging completed!`,
  refundCompleted: msg`Refund completed!`,
}

// Map BridgingFlowStep to SwapAndBridgeStatus for consistent icon usage
const stepToStatusMap: Record<BridgingFlowStep, SwapAndBridgeStatus> = {
  bridgingInProgress: SwapAndBridgeStatus.PENDING,
  bridgingFailed: SwapAndBridgeStatus.FAILED,
  bridgingFinished: SwapAndBridgeStatus.DONE,
  refundCompleted: SwapAndBridgeStatus.REFUND_COMPLETE,
}

/**
 * Creates a TokenLogo element with consistent styling
 */
function createTokenLogo(token: Currency, stepName: BridgingFlowStep): ReactNode {
  return <styledEl.TokenLogo token={token} size={TOKEN_LOGO_SIZE} $step={stepName} $tokenSize={TOKEN_LOGO_SIZE} />
}

export interface BridgingStatusHeaderProps {
  sellToken: Currency
  buyToken: Currency
  stepName: BridgingFlowStep
}

export function BridgingStatusHeader({ stepName, sellToken, buyToken }: BridgingStatusHeaderProps): ReactNode {
  const { i18n } = useLingui()
  const isBridgingFailed = stepName === 'bridgingFailed'
  const sellTokenEl = createTokenLogo(sellToken, stepName)
  const buyTokenEl = createTokenLogo(buyToken, stepName)

  return (
    <styledEl.Header $step={stepName}>
      <styledEl.HeaderState>
        {!isBridgingFailed && sellTokenEl}
        <styledEl.StatusIcon $step={stepName}>{swapStatusIcons[stepToStatusMap[stepName]]}</styledEl.StatusIcon>
        {!isBridgingFailed ? buyTokenEl : sellTokenEl}
      </styledEl.HeaderState>
      <h3>{i18n._(titles[stepName])}</h3>
    </styledEl.Header>
  )
}
