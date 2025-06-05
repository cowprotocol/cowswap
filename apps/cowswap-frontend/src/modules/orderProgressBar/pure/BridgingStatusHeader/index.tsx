import React from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { Currency, Token } from '@uniswap/sdk-core'

import { SwapStatusIcons } from 'modules/bridge/pure/StopStatus'
import { SwapAndBridgeStatus } from 'modules/bridge/types'

import * as styledEl from './styled'

import { BridgingFlowStep } from '../../types'

const TOKEN_LOGO_SIZE = 46

const titles: Record<BridgingFlowStep, string> = {
  bridgingInProgress: 'Bridging to destination...',
  bridgingFailed: 'Bridging failed. Refund started...',
  bridgingFinished: 'Bridging completed!',
  refundCompleted: 'Refund completed!',
}

// Map BridgingFlowStep to SwapAndBridgeStatus for consistent icon usage
const stepToStatusMap: Record<BridgingFlowStep, SwapAndBridgeStatus> = {
  bridgingInProgress: SwapAndBridgeStatus.PENDING,
  bridgingFailed: SwapAndBridgeStatus.FAILED,
  bridgingFinished: SwapAndBridgeStatus.DONE,
  refundCompleted: SwapAndBridgeStatus.REFUND_COMPLETE,
}

/**
 * Creates a token with explicit chain ID if the token is a Token instance and chainId is provided
 */
function createTokenWithChain(token: Currency, chainId?: number): Currency {
  return chainId ? new Token(chainId, getCurrencyAddress(token), token.decimals, token.symbol, token.name) : token
}

/**
 * Creates a TokenLogo element with consistent styling
 */
function createTokenLogo(token: Currency, stepName: BridgingFlowStep): React.JSX.Element {
  return <styledEl.TokenLogo token={token} size={TOKEN_LOGO_SIZE} $step={stepName} $tokenSize={TOKEN_LOGO_SIZE} />
}

export interface BridgingStatusHeaderProps {
  sellToken: Currency
  buyToken: Currency
  stepName: BridgingFlowStep
  sourceChainId?: number
  destinationChainId?: number
}

export function BridgingStatusHeader({
  stepName,
  sellToken,
  buyToken,
  sourceChainId,
  destinationChainId,
}: BridgingStatusHeaderProps): React.JSX.Element {
  const isBridgingFailed = stepName === 'bridgingFailed'

  const sellTokenWithChain = createTokenWithChain(sellToken, sourceChainId)
  const buyTokenWithChain = createTokenWithChain(buyToken, destinationChainId)

  const sellTokenEl = createTokenLogo(sellTokenWithChain, stepName)
  const buyTokenEl = createTokenLogo(buyTokenWithChain, stepName)

  return (
    <styledEl.Header $step={stepName}>
      <styledEl.HeaderState>
        {!isBridgingFailed && sellTokenEl}
        <styledEl.StatusIcon $step={stepName}>{SwapStatusIcons[stepToStatusMap[stepName]]}</styledEl.StatusIcon>
        {!isBridgingFailed ? buyTokenEl : sellTokenEl}
      </styledEl.HeaderState>
      <h3>{titles[stepName]}</h3>
    </styledEl.Header>
  )
}
