/**
 * Component to display bridge-related information in the collapsed state of an accordion.
 * Shows the bridge time estimation and protocol icons next to the fee amount.
 */

import { ReactNode } from 'react'

import { displayTime } from '@cowprotocol/common-utils'
import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'

import { ProtocolIcons } from './ProtocolIcons'

interface BridgeAccordionSummaryProps {
  /** Estimated time for bridge transaction in minutes */
  bridgeEstimatedTime?: number
  /** Information about the bridge protocol */
  bridgeProtocol: BridgeProviderInfo
  children: ReactNode
}

/**
 * Component to display bridge-related information in the collapsed state of an accordion
 * Shows the bridge time estimation and protocol icons next to the fee amount
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BridgeAccordionSummary({ bridgeEstimatedTime, bridgeProtocol, children }: BridgeAccordionSummaryProps) {
  return (
    <>
      <span>
        {children}
        {bridgeEstimatedTime !== undefined && (
          <span title={`Estimated bridge transaction time: ${bridgeEstimatedTime} minutes`}>
            / {displayTime(bridgeEstimatedTime * 1000, true)}
          </span>
        )}
      </span>
      <span>{bridgeProtocol && <ProtocolIcons secondProtocol={bridgeProtocol} size={18} />}</span>
    </>
  )
}
