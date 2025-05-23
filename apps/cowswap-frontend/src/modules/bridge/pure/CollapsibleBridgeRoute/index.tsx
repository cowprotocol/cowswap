import { ReactNode, useState } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'

import { Wrapper } from '../../containers/BridgeRouteBreakdown/styled'
import { RouteOverviewTitle } from '../RouteOverviewTitle'

interface CollapsibleBridgeRouteProps {
  isCollapsible?: boolean
  isExpanded?: boolean
  children: ReactNode
  providerInfo: BridgeProviderInfo
  collapsedDefault?: ReactNode
}

export function CollapsibleBridgeRoute(props: CollapsibleBridgeRouteProps) {
  const { isCollapsible = false, children, providerInfo, collapsedDefault } = props

  const [isExpanded, setIsExpanded] = useState(props.isExpanded || false)

  const toggleExpanded = () => setIsExpanded((state) => !state)

  return (
    <Wrapper>
      {isCollapsible && (
        <RouteOverviewTitle
          isCollapsible={true}
          isExpanded={isExpanded}
          providerInfo={providerInfo}
          onClick={toggleExpanded}
        />
      )}
      {isExpanded ? children : collapsedDefault}
    </Wrapper>
  )
}
