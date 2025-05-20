import { ReactNode, useState } from 'react'

import { ToggleArrow } from 'common/pure/ToggleArrow'

import {
  ClickableStopTitle,
  SectionContent,
  StopTitle as BaseStopTitle,
  ExplorerLink,
  ToggleIconContainer,
} from '../../styles'
import { BridgeProtocolConfig } from '../../types'
import { StopStatusEnum } from '../../utils'
import { BridgeRouteTitle } from '../BridgeRouteTitle'

export interface BridgeDetailsContainerProps {
  status: StopStatusEnum
  stopNumber: number
  statusIcon: ReactNode
  titlePrefix: ReactNode
  protocolName: string
  bridgeProvider: BridgeProtocolConfig
  protocolIconShowOnly?: 'first' | 'second'
  protocolIconSize?: number

  children: ReactNode
  isCollapsible?: boolean
  defaultExpanded?: boolean
  onToggle?: (isExpanded: boolean) => void
  explorerUrl?: string
}

export function BridgeDetailsContainer({
  status,
  stopNumber,
  statusIcon,
  titlePrefix,
  protocolName,
  bridgeProvider,
  protocolIconShowOnly,
  protocolIconSize,
  children,
  isCollapsible = false,
  defaultExpanded = true,
  onToggle,
  explorerUrl,
}: BridgeDetailsContainerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleToggle = () => {
    const newExpandedState = !isExpanded
    setIsExpanded(newExpandedState)
    onToggle?.(newExpandedState)
  }

  const titleContent = (
    <BridgeRouteTitle
      stopNumber={stopNumber}
      status={status}
      icon={statusIcon}
      titlePrefix={titlePrefix}
      protocolName={protocolName}
      bridgeProvider={bridgeProvider}
      protocolIconShowOnly={protocolIconShowOnly}
      protocolIconSize={protocolIconSize}
    />
  )

  const viewDetailsLink =
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

  const StopTitleComponent = isCollapsible ? ClickableStopTitle : BaseStopTitle

  return (
    <>
      <StopTitleComponent
        onClick={isCollapsible ? handleToggle : undefined}
        onKeyDown={
          isCollapsible ? (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && handleToggle() : undefined
        }
        role={isCollapsible ? 'button' : undefined}
        tabIndex={isCollapsible ? 0 : undefined}
        aria-expanded={isCollapsible ? isExpanded : undefined}
      >
        {titleContent}
        {viewDetailsLink}
        {isCollapsible && (
          <ToggleIconContainer>
            <ToggleArrow isOpen={isExpanded} />
          </ToggleIconContainer>
        )}
      </StopTitleComponent>
      <SectionContent isExpanded={isExpanded}>{children}</SectionContent>
    </>
  )
}
