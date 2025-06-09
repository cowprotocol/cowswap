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
  stopNumber?: number
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BridgeRouteTitle({
  status,
  icon,
  titlePrefix,
  protocolName,
  bridgeProvider,
  protocolIconShowOnly,
  protocolIconSize = 21,
  stopNumber,
}: BridgeRouteTitleProps) {
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
        />
        <span> {protocolName}</span>
      </b>
    </>
  )
}
