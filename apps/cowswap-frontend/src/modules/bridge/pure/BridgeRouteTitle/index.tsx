import React, { ReactNode } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { UI } from '@cowprotocol/ui'

import { StopNumberCircle } from '../../styles'
import { SwapAndBridgeStatus } from '../../types'
import { ProtocolIcons } from '../ProtocolIcons'

interface BridgeRouteTitleProps {
  status: SwapAndBridgeStatus
  icon: ReactNode
  titlePrefix: ReactNode
  protocolName: string
  bridgeProvider: BridgeProviderInfo
  protocolIconShowOnly?: 'first' | 'second'
  protocolIconSize?: number
  stopNumber?: number
}
export function BridgeRouteTitle({
  status,
  icon,
  titlePrefix,
  protocolName,
  bridgeProvider,
  protocolIconShowOnly,
  protocolIconSize = 21,
  stopNumber,
}: BridgeRouteTitleProps): React.JSX.Element {
  return (
    <>
      <StopNumberCircle status={status} stopNumber={stopNumber}>
        {icon}
      </StopNumberCircle>
      <b>
        <span>{titlePrefix} </span>
        <ProtocolIcons
          size={protocolIconSize}
          showOnlyFirst={protocolIconShowOnly === 'first'}
          showOnlySecond={protocolIconShowOnly === 'second'}
          secondProtocol={bridgeProvider}
          borderColor={UI.COLOR_PAPER_DARKER}
        />
        <span> {protocolName}</span>
      </b>
    </>
  )
}
