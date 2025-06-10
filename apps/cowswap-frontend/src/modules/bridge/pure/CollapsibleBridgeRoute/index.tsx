import { ReactNode, useState } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { RouteOverviewTitle } from '../RouteOverviewTitle'

const Wrapper = styled.div`
  width: 100%;
  background: transparent;
  display: flex;
  flex-flow: column wrap;
  gap: 4px;
  padding: 0;
  box-sizing: border-box;

  ${Media.upToSmall()} {
    padding: 0;
  }
`

interface CollapsibleBridgeRouteProps {
  isCollapsible?: boolean
  isExpanded?: boolean
  children: ReactNode
  providerInfo: BridgeProviderInfo
  collapsedDefault?: ReactNode
  className?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CollapsibleBridgeRoute(props: CollapsibleBridgeRouteProps) {
  const { isCollapsible = false, children, providerInfo, collapsedDefault, className } = props

  const [isExpanded, setIsExpanded] = useState(props.isExpanded || false)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const toggleExpanded = () => setIsExpanded((state) => !state)

  return (
    <Wrapper className={className}>
      {isCollapsible && (
        <RouteOverviewTitle
          isCollapsible
          isExpanded={isExpanded}
          providerInfo={providerInfo}
          onClick={toggleExpanded}
        />
      )}
      {isExpanded ? children : collapsedDefault}
    </Wrapper>
  )
}
