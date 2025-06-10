import { Currency } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import bridgingFinishedIcon from './icons/bridgingFinished.svg'
import bridgingPendingIcon from './icons/bridgingPending.svg'
import bridgingRefundingIcon from './icons/bridgingRefunding.svg'
import * as styledEl from './styled'

import { BridgingFlowStep } from '../../types'

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

export interface BridgingStatusHeaderProps {
  sellToken: Currency
  buyToken: Currency
  stepName: BridgingFlowStep
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BridgingStatusHeader({ stepName, sellToken, buyToken }: BridgingStatusHeaderProps) {
  const isBridgingFailed = stepName === 'bridgingFailed'
  const sellTokenEl = <styledEl.TokenLogo token={sellToken} size={36} />
  const buyTokenEl = <styledEl.TokenLogo token={buyToken} size={36} />

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
