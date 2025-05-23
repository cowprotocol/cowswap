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
  className?: string
}

export function CollapsibleBridgeRoute(props: CollapsibleBridgeRouteProps) {
  const { isCollapsible = false, children, providerInfo, collapsedDefault, className } = props

  const [isExpanded, setIsExpanded] = useState(props.isExpanded || false)

  const toggleExpanded = () => setIsExpanded((state) => !state)

  return (
    <Wrapper className={className}>
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
