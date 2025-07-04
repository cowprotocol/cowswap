import { ReactNode } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'

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
  circleSize?: number
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
  circleSize,
  stopNumber,
}: BridgeRouteTitleProps): ReactNode {
  return (
    <>
      <StopNumberCircle status={status} stopNumber={stopNumber} size={circleSize}>
        {icon}
      </StopNumberCircle>
      <b>
        {titlePrefix && <span>{titlePrefix} </span>}
        <ProtocolIcons
          size={protocolIconSize}
          showOnlyFirst={protocolIconShowOnly === 'first'}
          showOnlySecond={protocolIconShowOnly === 'second'}
          secondProtocol={bridgeProvider}
        />
        <span> {protocolName}</span>
      </b>
    </>
  )
}
