import { ReactNode } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'

import SVG from 'react-inlinesvg'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import { StopNumberCircle, ToggleArrow, ToggleIconContainer } from '../../styles'
import { BridgeProtocolConfig } from '../../types'
import { StopStatusEnum } from '../../utils'

interface BridgeRouteTitleProps {
  status: StopStatusEnum
  icon: ReactNode
  title: ReactNode
  providerTitle: string
  bridgeProvider: BridgeProtocolConfig
  isCollapsible: boolean
  isExpanded: boolean
  stopNumber: number
}
export function BridgeRouteTitle({
  status,
  icon,
  title,
  providerTitle,
  bridgeProvider,
  isCollapsible,
  isExpanded,
  stopNumber,
}: BridgeRouteTitleProps) {
  return (
    <>
      <StopNumberCircle status={status} stopNumber={stopNumber}>
        {icon}
      </StopNumberCircle>
      <b>
        <span>{title} </span>
        <ProtocolIcons showOnlySecond size={21} secondProtocol={bridgeProvider} />
        <span> {providerTitle}</span>
      </b>
      {isCollapsible && (
        <ToggleIconContainer>
          <ToggleArrow isOpen={isExpanded}>
            <SVG src={CarretIcon} title={isExpanded ? 'Close' : 'Open'} />
          </ToggleArrow>
        </ToggleIconContainer>
      )}
    </>
  )
}
