import { UI } from '@cowprotocol/ui'
import { Currency, Token } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import bridgingFinishedIcon from './icons/bridgingFinished.svg'
import bridgingPendingIcon from './icons/bridgingPending.svg'
import bridgingRefundingIcon from './icons/bridgingRefunding.svg'
import * as styledEl from './styled'

import { BridgingFlowStep } from '../../types'

const TOKEN_LOGO_SIZE = 46
const TOKEN_CHAIN_BORDER_COLOR = `var(${UI.COLOR_BLUE_100_PRIMARY})`

const titles: Record<BridgingFlowStep, string> = {
  bridgingInProgress: 'Bridging to destination...',
  bridgingFailed: 'Bridging failed. Refund started...',
  bridgingFinished: 'Bridging completed!',
  refundCompleted: 'Refund completed!',
}

const icons: Record<BridgingFlowStep, string> = {
  bridgingInProgress: bridgingPendingIcon,
  bridgingFailed: bridgingRefundingIcon,
  bridgingFinished: bridgingFinishedIcon,
  refundCompleted: bridgingFinishedIcon,
}

/**
 * Creates a token with explicit chain ID if the token is a Token instance and chainId is provided
 */
function createTokenWithChain(token: Currency, chainId?: number): Currency {
  return chainId && token.isToken ? new Token(chainId, token.address, token.decimals, token.symbol, token.name) : token
}

/**
 * Creates a TokenLogo element with consistent styling
 */
function createTokenLogo(token: Currency) {
  return <styledEl.TokenLogo token={token} chainBorderColor={TOKEN_CHAIN_BORDER_COLOR} size={TOKEN_LOGO_SIZE} />
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
}: BridgingStatusHeaderProps) {
  const isBridgingFailed = stepName === 'bridgingFailed'

  const sellTokenWithChain = createTokenWithChain(sellToken, sourceChainId)
  const buyTokenWithChain = createTokenWithChain(buyToken, destinationChainId)

  const sellTokenEl = createTokenLogo(sellTokenWithChain)
  const buyTokenEl = createTokenLogo(buyTokenWithChain)

  return (
    <styledEl.Header $step={stepName}>
      <styledEl.HeaderState>
        {!isBridgingFailed && sellTokenEl}
        <SVG src={icons[stepName]} title={stepName} />
        {!isBridgingFailed ? buyTokenEl : sellTokenEl}
      </styledEl.HeaderState>
      <h3>{titles[stepName]}</h3>
    </styledEl.Header>
  )
}
