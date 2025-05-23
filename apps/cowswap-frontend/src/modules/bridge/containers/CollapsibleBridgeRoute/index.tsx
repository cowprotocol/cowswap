import { ReactNode, useState } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'

import { RouteOverviewTitle } from '../../pure/RouteOverviewTitle'
import { Wrapper } from '../BridgeRouteBreakdown/styled'

interface CollapsibleBridgeRouteProps {
  isExpanded?: boolean
  children: ReactNode
  providerInfo: BridgeProviderInfo
  collapsedDefault?: ReactNode
}

export function CollapsibleBridgeRoute(props: CollapsibleBridgeRouteProps) {
  const { children, providerInfo, collapsedDefault } = props

  const [isExpanded, setIsExpanded] = useState(props.isExpanded || false)

  const toggleExpanded = () => setIsExpanded((state) => !state)

  return (
    <Wrapper>
      <RouteOverviewTitle
        isCollapsible={true}
        isExpanded={isExpanded}
        providerInfo={providerInfo}
        onClick={toggleExpanded}
      />
      {isExpanded ? children : collapsedDefault}
    </Wrapper>
  )
}
