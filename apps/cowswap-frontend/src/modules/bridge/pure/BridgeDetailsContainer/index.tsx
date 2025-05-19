import { ReactNode, useState } from 'react'

import { ClickableStopTitle, SectionContent, StopTitle } from '../../styles'
import { BridgeProtocolConfig } from '../../types'
import { StopStatusEnum } from '../../utils'
import { BridgeRouteTitle } from '../BridgeRouteTitle'

export interface BridgeDetailsContainerProps {
  status: StopStatusEnum
  icon: ReactNode
  title: ReactNode
  providerTitle: string
  bridgeProvider: BridgeProtocolConfig
  stopNumber: number

  children: ReactNode
  isCollapsible?: boolean
}

export function BridgeDetailsContainer({
  status,
  icon,
  title,
  providerTitle,
  bridgeProvider,
  children,
  isCollapsible = false,
}: BridgeDetailsContainerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const TitleContent = (
    <BridgeRouteTitle
      stopNumber={1}
      status={status}
      icon={icon}
      title={title}
      bridgeProvider={bridgeProvider}
      providerTitle={providerTitle}
      isCollapsible={isCollapsible}
      isExpanded={isExpanded}
    />
  )

  const onToggle = () => setIsExpanded((prev) => !prev)

  return (
    <>
      {isCollapsible ? (
        <ClickableStopTitle isCollapsible={true} onClick={onToggle}>
          {TitleContent}
        </ClickableStopTitle>
      ) : (
        <StopTitle>{TitleContent}</StopTitle>
      )}
      <SectionContent isExpanded={isExpanded}>{children}</SectionContent>
    </>
  )
}
