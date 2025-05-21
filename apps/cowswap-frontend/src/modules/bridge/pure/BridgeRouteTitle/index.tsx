import { ReactNode } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import { StopNumberCircle } from '../../styles'
import { StopStatusEnum } from '../../utils'

interface BridgeRouteTitleProps {
  status: StopStatusEnum
  icon: ReactNode
  titlePrefix: ReactNode
  protocolName: string
  bridgeProvider: BridgeProviderInfo
  protocolIconShowOnly?: 'first' | 'second'
  protocolIconSize?: number
  stopNumber: number
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
