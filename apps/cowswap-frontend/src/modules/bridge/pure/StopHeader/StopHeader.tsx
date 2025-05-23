import { ReactNode } from 'react'

import { ClickableStopTitle, StopTitle as BaseStopTitle, ExplorerLink } from '../../styles'
import { BridgeProtocolConfig } from '../../types'
import { StopStatusEnum } from '../../utils/status'
import { BridgeRouteTitle } from '../BridgeRouteTitle'

export interface StopHeaderProps {
  status: StopStatusEnum
  stopNumber: number
  statusIcons: Record<StopStatusEnum, ReactNode>
  statusTitlePrefix: ReactNode

  protocolName: string
  protocolIconSize?: number
  protocolIconShowOnly?: 'first' | 'second'
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
  const titleSection = (
    <BridgeRouteTitle
      status={status}
      stopNumber={stopNumber}
      icon={statusIcons[status]}
      titlePrefix={statusTitlePrefix}
      protocolName={protocolName}
      bridgeProvider={protocolIconBridgeProvider}
      protocolIconShowOnly={protocolIconShowOnly}
      protocolIconSize={protocolIconSize}
    />
  )

  const ViewDetailsLink =
    explorerUrl && status !== StopStatusEnum.DEFAULT ? (
      <ExplorerLink
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View transaction details on explorer (opens in new tab)"
      >
        View details <span aria-hidden="true">↗</span>
      </ExplorerLink>
    ) : null

  if (isCollapsible) {
    return (
      <ClickableStopTitle
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle?.()}
        isCollapsible={true}
        aria-expanded={isExpanded}
      >
        {titleSection}
        {ViewDetailsLink}
      </ClickableStopTitle>
    )
  }

  return (
    <BaseStopTitle>
      {titleSection}
      {ViewDetailsLink}
    </BaseStopTitle>
  )
}
