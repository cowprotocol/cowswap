import { ReactNode } from 'react'

import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import SpinnerIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import CLOSE_ICON_X from '@cowprotocol/assets/cow-swap/x.svg'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { StyledSpinnerIcon, StyledRefundCompleteIcon } from '../../styles'
import { SwapAndBridgeStatus } from '../../types'

const StyledStatusCheckmarkIcon = styled(SVG)`
  width: 24px;
  height: 18px;
  color: var(${UI.COLOR_SUCCESS});
`

const StyledStatusCloseIcon = styled(SVG)`
  color: var(${UI.COLOR_DANGER_TEXT});
  width: 18px;
  height: 18px;
`
/**
 * This module centralizes all status-related constants for the bridge module
 * It contains icons and text for different status states across both
 * swap and bridge operations.
 */

const CloseIcon = <StyledStatusCloseIcon src={CLOSE_ICON_X} />

// Base set of icons for status states, used by both swap and bridge
export const CommonStatusIcons: Record<SwapAndBridgeStatus, ReactNode> = {
  [SwapAndBridgeStatus.DONE]: <StyledStatusCheckmarkIcon src={CheckmarkIcon} />,
  [SwapAndBridgeStatus.PENDING]: <StyledSpinnerIcon src={SpinnerIcon} />,
  [SwapAndBridgeStatus.FAILED]: CloseIcon,
  [SwapAndBridgeStatus.REFUND_COMPLETE]: CloseIcon,
  [SwapAndBridgeStatus.DEFAULT]: null,
}

// Swap has custom icons for different states
export const SwapStatusIcons: Record<SwapAndBridgeStatus, ReactNode> = {
  ...CommonStatusIcons,
  [SwapAndBridgeStatus.FAILED]: <SVG src={RefundIcon} />,
  [SwapAndBridgeStatus.REFUND_COMPLETE]: <StyledRefundCompleteIcon src={RefundIcon} />,
}

// Bridge uses the common icons without modification
export const BridgeStatusIcons = CommonStatusIcons

// Title text used for different swap states
export const SwapStatusTitlePrefixes: Record<SwapAndBridgeStatus, string> = {
  [SwapAndBridgeStatus.DONE]: 'Swapped on',
  [SwapAndBridgeStatus.PENDING]: 'Swapping on',
  [SwapAndBridgeStatus.FAILED]: 'Swap failed',
  [SwapAndBridgeStatus.REFUND_COMPLETE]: 'Swap refunded',
  [SwapAndBridgeStatus.DEFAULT]: 'Swap on',
}

// Reusable text for different states
export const bridgeFailedTitle = 'Bridge failed on'

// Title text used for different bridge states
export const BridgeStatusTitlePrefixes: Record<SwapAndBridgeStatus, string> = {
  [SwapAndBridgeStatus.DONE]: 'Bridged via',
  [SwapAndBridgeStatus.PENDING]: 'Bridging via',
  [SwapAndBridgeStatus.FAILED]: bridgeFailedTitle,
  [SwapAndBridgeStatus.REFUND_COMPLETE]: bridgeFailedTitle,
  [SwapAndBridgeStatus.DEFAULT]: 'Bridge via',
}
