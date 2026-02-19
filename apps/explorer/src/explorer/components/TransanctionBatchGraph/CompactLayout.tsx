import { useCallback, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { getBlockExplorerUrl } from '@cowprotocol/common-utils'
import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CowNode, RouteNode } from './CompactLayout.centerNodes'
import { RouteSelection } from './CompactLayout.interactions'
import { FlowLinks } from './CompactLayout.links'
import { DESKTOP_CHART_WIDTH, MOBILE_CHART_WIDTH, createSankeyModel, SankeyModel } from './CompactLayout.model'
import { LeftNodes, RightNodes } from './CompactLayout.sideNodes'
import { CompactRoute, CowFlowSummary } from './types'

import { Network } from '../../../types'

const Wrapper = styled.div`
  border: 1px solid ${Color.explorer_border};
  border-radius: 0.8rem;
  background: ${Color.explorer_bg2};
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.8rem;
`

const Svg = styled.svg<{ $minWidth: number }>`
  display: block;
  width: 100%;
  min-width: ${({ $minWidth }): string => `${$minWidth}px`};
`

type CompactLayoutProps = {
  routes: CompactRoute[]
  dexLabel: string
  dexAddress?: string
  networkId: Network | undefined
  hasPossibleCow: boolean
  cowFlow?: CowFlowSummary
  showUsdValues: boolean
}

type CompactSankeyCanvasProps = {
  activeRouteIds?: string[]
  cowFlow?: CowFlowSummary
  dexAddress?: string
  dexLabel: string
  hideEdgeLabels: boolean
  model: SankeyModel
  networkId: Network | undefined
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  routeExplorerLink?: string
  routeStroke: string
  routes: CompactRoute[]
  showUsdValues: boolean
}

type CompactSankeyLinksProps = {
  activeRouteIds?: string[]
  hideLabels: boolean
  model: SankeyModel
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
}

export function CompactLayout({
  routes,
  dexLabel,
  dexAddress,
  networkId,
  hasPossibleCow,
  cowFlow,
  showUsdValues,
}: CompactLayoutProps): JSX.Element {
  const [activeRouteIds, setActiveRouteIds] = useState<string[]>()
  const isMobile = useMediaQuery(Media.upToMedium(false))
  const onRouteEnter = useCallback((selection: RouteSelection): void => {
    const next = Array.isArray(selection) ? Array.from(new Set(selection)) : [selection]
    setActiveRouteIds(next.length ? next : undefined)
  }, [])
  const onRouteLeave = useCallback((): void => setActiveRouteIds(undefined), [])

  if (!routes.length) {
    return <Wrapper>No flow data available for compact mode.</Wrapper>
  }

  const model = createSankeyModel(routes, cowFlow, showUsdValues, isMobile)
  const routeExplorerLink = networkId && dexAddress ? getBlockExplorerUrl(networkId, 'contract', dexAddress) : undefined
  const routeStroke = hasPossibleCow ? Color.explorer_border : Color.explorer_borderPrimary

  return (
    <Wrapper>
      <CompactSankeyCanvas
        activeRouteIds={activeRouteIds}
        cowFlow={cowFlow}
        dexAddress={dexAddress}
        dexLabel={dexLabel}
        hideEdgeLabels={isMobile}
        model={model}
        networkId={networkId}
        onRouteEnter={onRouteEnter}
        onRouteLeave={onRouteLeave}
        routeExplorerLink={routeExplorerLink}
        routeStroke={routeStroke}
        routes={routes}
        showUsdValues={showUsdValues}
      />
    </Wrapper>
  )
}

function CompactSankeyCanvas({
  activeRouteIds,
  cowFlow,
  dexAddress,
  dexLabel,
  hideEdgeLabels,
  model,
  networkId,
  onRouteEnter,
  onRouteLeave,
  routeExplorerLink,
  routeStroke,
  routes,
  showUsdValues,
}: CompactSankeyCanvasProps): JSX.Element {
  const ammRouteIds = getUniqueRouteIds([...model.sellLinks, ...model.buyLinks])
  const cowRouteIds = getUniqueRouteIds([...model.cowInLinks, ...model.cowOutLinks])
  const cowNode = getCowNode({
    activeRouteIds,
    cowFlow,
    cowRouteIds,
    model,
    onRouteEnter,
    onRouteLeave,
    showUsdValues,
  })

  return (
    <Svg
      $minWidth={hideEdgeLabels ? MOBILE_CHART_WIDTH : DESKTOP_CHART_WIDTH}
      role="img"
      viewBox={`0 0 ${model.chartWidth} ${model.chartHeight}`}
    >
      <CompactSankeyLinks
        activeRouteIds={activeRouteIds}
        hideLabels={hideEdgeLabels}
        model={model}
        onRouteEnter={onRouteEnter}
        onRouteLeave={onRouteLeave}
      />
      <LeftNodes
        activeRouteIds={activeRouteIds}
        model={model}
        networkId={networkId}
        onRouteEnter={onRouteEnter}
        onRouteLeave={onRouteLeave}
        routes={routes}
        showUsdValues={showUsdValues}
      />
      {cowNode}
      <RouteNode
        activeRouteIds={activeRouteIds}
        centerHeight={model.routeHeight}
        centerX={model.centerX}
        centerY={model.routeY}
        connectedRouteIds={ammRouteIds}
        dexAddress={dexAddress}
        dexLabel={dexLabel}
        nodeWidth={model.nodeWidth}
        onRouteEnter={onRouteEnter}
        onRouteLeave={onRouteLeave}
        routeExplorerLink={routeExplorerLink}
        routeStroke={routeStroke}
      />
      <RightNodes
        activeRouteIds={activeRouteIds}
        model={model}
        networkId={networkId}
        onRouteEnter={onRouteEnter}
        onRouteLeave={onRouteLeave}
        routes={routes}
        showUsdValues={showUsdValues}
      />
    </Svg>
  )
}

function CompactSankeyLinks({
  activeRouteIds,
  hideLabels,
  model,
  onRouteEnter,
  onRouteLeave,
}: CompactSankeyLinksProps): JSX.Element {
  const links = [
    { links: model.sellLinks, strokeColor: Color.explorer_textError },
    { links: model.buyLinks, strokeColor: Color.explorer_green1 },
    { links: model.cowInLinks, strokeColor: Color.explorer_yellow4 },
    { links: model.cowOutLinks, strokeColor: Color.explorer_yellow4 },
  ].filter((entry) => entry.links.length > 0)

  return (
    <>
      {links.map((entry) => (
        <FlowLinks
          key={`${entry.strokeColor}-${entry.links[0].id}`}
          activeRouteIds={activeRouteIds}
          hideLabels={hideLabels}
          links={entry.links}
          onRouteEnter={onRouteEnter}
          onRouteLeave={onRouteLeave}
          strokeColor={entry.strokeColor}
        />
      ))}
    </>
  )
}

function getUniqueRouteIds(links: { routeId: string }[]): string[] {
  return Array.from(new Set(links.map((link) => link.routeId)))
}

type CowNodeFactoryParams = {
  activeRouteIds?: string[]
  cowFlow?: CowFlowSummary
  cowRouteIds: string[]
  model: SankeyModel
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  showUsdValues: boolean
}

function getCowNode({
  activeRouteIds,
  cowFlow,
  cowRouteIds,
  model,
  onRouteEnter,
  onRouteLeave,
  showUsdValues,
}: CowNodeFactoryParams): JSX.Element | null {
  if (!cowFlow || model.cowY === undefined || model.cowHeight === undefined) {
    return null
  }

  return (
    <CowNode
      activeRouteIds={activeRouteIds}
      centerHeight={model.cowHeight}
      centerX={model.centerX}
      centerY={model.cowY}
      connectedRouteIds={cowRouteIds}
      estimatedLpFeeSavingsUsd={cowFlow.estimatedLpFeeSavingsUsd}
      matchedAmountLabel={cowFlow.matchedAmountLabel}
      matchedAmountUsdValue={cowFlow.matchedAmountUsdValue}
      nodeWidth={model.nodeWidth}
      onRouteEnter={onRouteEnter}
      onRouteLeave={onRouteLeave}
      showUsdValues={showUsdValues}
    />
  )
}
