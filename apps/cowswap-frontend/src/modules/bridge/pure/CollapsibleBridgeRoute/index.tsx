import { ReactNode, useState, useEffect } from 'react'

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
  forceExpandOnWarnings?: { showRecipientWarning: boolean; showPriceUpdated: boolean }
  children: ReactNode
  providerInfo: BridgeProviderInfo
  collapsedDefault?: ReactNode
  className?: string
}

export function CollapsibleBridgeRoute(props: CollapsibleBridgeRouteProps): ReactNode {
  const {
    isCollapsible = false,
    children,
    providerInfo,
    collapsedDefault,
    className,
    isExpanded: propIsExpanded,
    forceExpandOnWarnings,
  } = props

  const [isExpanded, setIsExpanded] = useState(propIsExpanded ?? false)

  // Force expansion when individual warnings appear
  useEffect(() => {
    if (forceExpandOnWarnings?.showPriceUpdated || forceExpandOnWarnings?.showRecipientWarning) {
      setIsExpanded(true)
    }
  }, [forceExpandOnWarnings?.showPriceUpdated, forceExpandOnWarnings?.showRecipientWarning])

  // Regular support for direct isExpanded prop
  useEffect(() => {
    if (propIsExpanded === true) {
      setIsExpanded(true)
    }
  }, [propIsExpanded])

  // TODO: Add proper return type annotation
  const toggleExpanded = (): void => setIsExpanded((state) => !state)

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
