import { ReactNode } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { Media, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

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

const ExplorerLink = styled.a`
  font-size: 11px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-decoration: underline;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }

  ${Media.upToSmall()} {
    order: 5;
    margin: 10px auto;
    font-size: 13px;
    background: var(${UI.COLOR_INFO_BG});
    color: var(${UI.COLOR_INFO_TEXT});
    width: 100%;
    padding: 8px;
    border-radius: 8px;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
  }
`

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
  explorerUrl?: string
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
  explorerUrl,
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
    </>
  )

  const ViewDetailsLink =
    explorerUrl && status !== StopStatusEnum.DEFAULT ? (
      <ExplorerLink href={explorerUrl} target="_blank" rel="noopener noreferrer">
        View details ↗
      </ExplorerLink>
    ) : null

  if (isCollapsible) {
    return (
      <ClickableStopTitle onClick={onToggle} isCollapsible={true}>
        {TitleContent}
        {ViewDetailsLink}
        <ToggleIconContainer>
          <ToggleArrow isOpen={isExpanded}>
            <SVG src={CarretIcon} title={isExpanded ? 'Close' : 'Open'} />
          </ToggleArrow>
        </ToggleIconContainer>
      </ClickableStopTitle>
    )
  }

  return (
    <BaseStopTitle>
      {TitleContent}
      {ViewDetailsLink}
    </BaseStopTitle>
  )
}
