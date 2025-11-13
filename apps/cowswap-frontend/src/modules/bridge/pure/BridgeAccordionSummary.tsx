/**
 * Component to display bridge-related information in the collapsed state of an accordion.
 * Shows the bridge time estimation and protocol icons next to the fee amount.
 */

import { ReactNode } from 'react'

import { displayTime } from '@cowprotocol/common-utils'
import { BridgeProviderInfo } from '@cowprotocol/sdk-bridging'
import { UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import styled from 'styled-components/macro'

import { ProtocolIcons } from './ProtocolIcons'

interface BridgeAccordionSummaryProps {
  /** Estimated time for bridge transaction in minutes */
  bridgeEstimatedTime?: number
  /** Information about the bridge protocol */
  bridgeProtocol: BridgeProviderInfo
  /** Whether the accordion is open */
  isOpen?: boolean
  children: ReactNode
}

const EstimatedTimeSpan = styled.span<{ isOpen?: boolean }>`
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${({ isOpen }) =>
    isOpen &&
    `
    opacity: 1;
  `}

  &:hover {
    opacity: 1;
  }
`

/**
 * Component to display bridge-related information in the collapsed state of an accordion
 * Shows the bridge time estimation and protocol icons next to the fee amount
 */
export function BridgeAccordionSummary({
  bridgeEstimatedTime,
  bridgeProtocol,
  isOpen,
  children,
}: BridgeAccordionSummaryProps): ReactNode {
  return (
    <>
      <span>
        {children}
        {bridgeEstimatedTime !== undefined && (
          <EstimatedTimeSpan
            title={t`Estimated bridge transaction time: ${bridgeEstimatedTime} minutes`}
            isOpen={isOpen}
          >
            / {displayTime(bridgeEstimatedTime * 1000, true)}
          </EstimatedTimeSpan>
        )}
      </span>
      <span>{bridgeProtocol && <ProtocolIcons secondProtocol={bridgeProtocol} size={18} />}</span>
    </>
  )
}
