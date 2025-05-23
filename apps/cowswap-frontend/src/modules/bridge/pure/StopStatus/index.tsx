import { ReactNode } from 'react'

import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import SpinnerIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import CLOSE_ICON_X from '@cowprotocol/assets/cow-swap/x.svg'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { StyledSpinnerIcon, StyledRefundCompleteIcon } from '../../styles'
import { StopStatusEnum } from '../../utils/status'

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
export const CommonStatusIcons: Record<StopStatusEnum, ReactNode> = {
  [StopStatusEnum.DONE]: <StyledStatusCheckmarkIcon src={CheckmarkIcon} />,
  [StopStatusEnum.PENDING]: <StyledSpinnerIcon src={SpinnerIcon} />,
  [StopStatusEnum.FAILED]: CloseIcon,
  [StopStatusEnum.REFUND_COMPLETE]: CloseIcon,
  [StopStatusEnum.DEFAULT]: null,
}

// Swap has custom icons for different states
export const SwapStatusIcons: Record<StopStatusEnum, ReactNode> = {
  ...CommonStatusIcons,
  [StopStatusEnum.FAILED]: <SVG src={RefundIcon} />,
  [StopStatusEnum.REFUND_COMPLETE]: <StyledRefundCompleteIcon src={RefundIcon} />,
}

// Bridge uses the common icons without modification
export const BridgeStatusIcons = CommonStatusIcons

// Title text used for different swap states
export const SwapStatusTitlePrefixes: Record<StopStatusEnum, string> = {
  [StopStatusEnum.DONE]: 'Swapped on',
  [StopStatusEnum.PENDING]: 'Swapping on',
  [StopStatusEnum.FAILED]: 'Swap failed',
  [StopStatusEnum.REFUND_COMPLETE]: 'Swap refunded',
  [StopStatusEnum.DEFAULT]: 'Swap on',
}

// Reusable text for different states
export const bridgeFailedTitle = 'Bridge failed on'

// Title text used for different bridge states
export const BridgeStatusTitlePrefixes: Record<StopStatusEnum, string> = {
  [StopStatusEnum.DONE]: 'Bridged via',
  [StopStatusEnum.PENDING]: 'Bridging via',
  [StopStatusEnum.FAILED]: bridgeFailedTitle,
  [StopStatusEnum.REFUND_COMPLETE]: bridgeFailedTitle,
  [StopStatusEnum.DEFAULT]: 'Bridge via',
}
