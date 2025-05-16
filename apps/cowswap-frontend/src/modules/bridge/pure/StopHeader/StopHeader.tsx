import { ReactNode } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'

import SVG from 'react-inlinesvg'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import {
  StopNumberCircle,
  ToggleArrow,
  ToggleIconContainer,
  ClickableStopTitle,
  StopTitle as BaseStopTitle,
} from '../../styles'
import { BridgeProtocolConfig } from '../../types'
import { StopStatusEnum } from '../../utils/status'

export interface StopHeaderProps {
  status: StopStatusEnum
  stopNumber: number
  statusIcons: Record<StopStatusEnum, ReactNode>
  statusTitlePrefix: ReactNode

  protocolName: string
  protocolIconSize: number
  protocolIconShowOnly?: 'first' | 'second'
  // For ProtocolIcons, `secondProtocol` is the bridge provider.
  // `showOnlyFirst` means show CoW. `showOnlySecond` means show the bridge provider.
  protocolIconBridgeProvider: BridgeProtocolConfig

  isCollapsible: boolean
  isExpanded: boolean
  onToggle?: () => void
}

export function StopHeader({
  status,
  stopNumber,
  statusIcons,
  statusTitlePrefix,
  protocolName,
  protocolIconSize,
  protocolIconShowOnly,
  protocolIconBridgeProvider,
  isCollapsible,
  isExpanded,
  onToggle,
}: StopHeaderProps): ReactNode {
  const TitleContent = (
    <>
      <StopNumberCircle status={status} stopNumber={stopNumber}>
        {statusIcons[status]}
      </StopNumberCircle>
      <b>
        <span>{statusTitlePrefix} </span>
        <ProtocolIcons
          size={protocolIconSize}
          showOnlyFirst={protocolIconShowOnly === 'first'}
          showOnlySecond={protocolIconShowOnly === 'second'}
          secondProtocol={protocolIconBridgeProvider}
        />
        <span> {protocolName}</span>
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

  if (isCollapsible) {
    return (
      <ClickableStopTitle onClick={onToggle} isCollapsible={true}>
        {TitleContent}
      </ClickableStopTitle>
    )
  }

  return <BaseStopTitle>{TitleContent}</BaseStopTitle>
}
