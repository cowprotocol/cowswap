import { type ReactNode, useCallback, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { getBlockExplorerUrl } from '@cowprotocol/common-utils'
import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CowNode, RouteNode } from './CompactLayout.centerNodes'
import { ActiveFlowFocus, RouteSelection } from './CompactLayout.interactions'
import { FlowLinks } from './CompactLayout.links'
import { DESKTOP_CHART_WIDTH, MOBILE_CHART_WIDTH, createSankeyModel, SankeyModel } from './CompactLayout.model'
import { LeftNodes, RightNodes } from './CompactLayout.sideNodes'
import { CompactRoute, CowFlowSummary } from './types'

import { Network } from '../../../types'

const Wrapper = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.8rem;
`

const Svg = styled.svg<{ $minWidth: number }>`
  display: block;
  width: 100%;
  min-width: ${({ $minWidth }): string => `${$minWidth}px`};
  border-radius: 0.8rem;
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
  activeFlowFocus?: ActiveFlowFocus
  activeRouteIds?: string[]
  cowFlow?: CowFlowSummary
  dexAddress?: string
  dexLabel: string
  hideEdgeLabels: boolean
  model: SankeyModel
  networkId: Network | undefined
  onAmmEnter: (selection: RouteSelection) => void
  onCowEnter: (selection: RouteSelection) => void
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  routeExplorerLink?: string
  routeStroke: string
  routes: CompactRoute[]
  showUsdValues: boolean
}

type CompactSankeyLinksProps = {
  activeFlowFocus?: ActiveFlowFocus
  activeRouteIds?: string[]
  flowKind?: 'cow' | 'amm'
  hideLabels: boolean
  model: SankeyModel
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
}

type CompactCenterNodesProps = {
  activeFlowFocus?: ActiveFlowFocus
  activeRouteIds?: string[]
  cowFlow?: CowFlowSummary
  dexAddress?: string
  dexLabel: string
  model: SankeyModel
  networkId: Network | undefined
  onAmmEnter: (selection: RouteSelection) => void
  onCowEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  routeExplorerLink?: string
  routeStroke: string
  showUsdValues: boolean
}

export function CompactLayout({
  routes,
  dexLabel,
  dexAddress,
  networkId,
  hasPossibleCow,
  cowFlow,
  showUsdValues,
}: CompactLayoutProps): ReactNode {
  const [activeRouteIds, setActiveRouteIds] = useState<string[]>()
  const [activeFlowFocus, setActiveFlowFocus] = useState<ActiveFlowFocus>()
  const isMobile = useMediaQuery(Media.upToMedium(false))
  const onRouteEnter = useCallback((selection: RouteSelection): void => {
    const next = Array.isArray(selection) ? Array.from(new Set(selection)) : [selection]
    setActiveRouteIds(next.length ? next : undefined)
    setActiveFlowFocus('route')
  }, [])
  const onCowEnter = useCallback((selection: RouteSelection): void => {
    const next = Array.isArray(selection) ? Array.from(new Set(selection)) : [selection]
    setActiveRouteIds(next.length ? next : undefined)
    setActiveFlowFocus('cow')
  }, [])
  const onAmmEnter = useCallback((selection: RouteSelection): void => {
    const next = Array.isArray(selection) ? Array.from(new Set(selection)) : [selection]
    setActiveRouteIds(next.length ? next : undefined)
    setActiveFlowFocus('amm')
  }, [])
  const onRouteLeave = useCallback((): void => {
    setActiveRouteIds(undefined)
    setActiveFlowFocus(undefined)
  }, [])

  if (!routes.length) {
    return <Wrapper>No flow data available for compact mode.</Wrapper>
  }

  const model = createSankeyModel(routes, cowFlow, showUsdValues, isMobile)
  const routeExplorerLink = networkId && dexAddress ? getBlockExplorerUrl(networkId, 'contract', dexAddress) : undefined
  const routeStroke = hasPossibleCow ? Color.explorer_border : Color.explorer_borderPrimary

  return (
    <Wrapper>
      <CompactSankeyCanvas
        activeFlowFocus={activeFlowFocus}
        activeRouteIds={activeRouteIds}
        cowFlow={cowFlow}
        dexAddress={dexAddress}
        dexLabel={dexLabel}
        hideEdgeLabels={isMobile}
        model={model}
        networkId={networkId}
        onAmmEnter={onAmmEnter}
        onCowEnter={onCowEnter}
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
  activeFlowFocus,
  activeRouteIds,
  cowFlow,
  dexAddress,
  dexLabel,
  hideEdgeLabels,
  model,
  networkId,
  onAmmEnter,
  onCowEnter,
  onRouteEnter,
  onRouteLeave,
  routeExplorerLink,
  routeStroke,
  routes,
  showUsdValues,
}: CompactSankeyCanvasProps): ReactNode {
  return (
    <Svg
      $minWidth={hideEdgeLabels ? MOBILE_CHART_WIDTH : DESKTOP_CHART_WIDTH}
      role="img"
      viewBox={`0 0 ${model.chartWidth} ${model.chartHeight}`}
    >
      <CanvasTextureBackground height={model.chartHeight} width={model.chartWidth} />
      <CompactSankeyLinks
        activeFlowFocus={activeFlowFocus}
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
      <CompactCenterNodes
        activeFlowFocus={activeFlowFocus}
        activeRouteIds={activeRouteIds}
        cowFlow={cowFlow}
        dexAddress={dexAddress}
        dexLabel={dexLabel}
        model={model}
        networkId={networkId}
        onAmmEnter={onAmmEnter}
        onCowEnter={onCowEnter}
        onRouteLeave={onRouteLeave}
        routeExplorerLink={routeExplorerLink}
        routeStroke={routeStroke}
        showUsdValues={showUsdValues}
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

function CompactCenterNodes({
  activeFlowFocus,
  activeRouteIds,
  cowFlow,
  dexAddress,
  dexLabel,
  model,
  networkId,
  onAmmEnter,
  onCowEnter,
  onRouteLeave,
  routeExplorerLink,
  routeStroke,
  showUsdValues,
}: CompactCenterNodesProps): ReactNode {
  const { ammRouteIds, cowRouteIds } = getCenterRouteIds(model)

  return (
    <>
      {getCowNode({
        activeFlowFocus,
        activeRouteIds,
        cowFlow,
        cowRouteIds,
        model,
        networkId,
        onRouteEnter: onCowEnter,
        onRouteLeave,
        showUsdValues,
      })}
      <RouteNode
        activeFlowFocus={activeFlowFocus}
        activeRouteIds={activeRouteIds}
        centerHeight={model.routeHeight}
        centerX={model.centerX}
        centerY={model.routeY}
        connectedRouteIds={ammRouteIds}
        dexAddress={dexAddress}
        dexLabel={dexLabel}
        nodeWidth={model.nodeWidth}
        onRouteEnter={onAmmEnter}
        onRouteLeave={onRouteLeave}
        routeExplorerLink={routeExplorerLink}
        routeStroke={routeStroke}
      />
    </>
  )
}

function CanvasTextureBackground({ width, height }: CanvasTextureBackgroundProps): ReactNode {
  return (
    <>
      <defs>
        <pattern height="18" id="sankey-grid-dot-pattern" patternUnits="userSpaceOnUse" width="18" x="0" y="0">
          <circle cx="1.5" cy="1.5" fill="#FFFFFF" r="1.05" />
        </pattern>
      </defs>
      <rect fill={Color.explorer_bg2} height={height} width={width} x={0} y={0} />
      <rect fill="url(#sankey-grid-dot-pattern)" height={height} opacity={0.03} width={width} x={0} y={0} />
    </>
  )
}

function CompactSankeyLinks({
  activeFlowFocus,
  activeRouteIds,
  hideLabels,
  model,
  onRouteEnter,
  onRouteLeave,
}: CompactSankeyLinksProps): ReactNode {
  const links = [
    { flowKind: 'amm' as const, links: model.sellLinks, strokeColor: Color.explorer_textError },
    { flowKind: 'amm' as const, links: model.buyLinks, strokeColor: Color.explorer_green1 },
    { flowKind: 'cow' as const, links: model.cowInLinks, strokeColor: Color.explorer_yellow4 },
    { flowKind: 'cow' as const, links: model.cowOutLinks, strokeColor: Color.explorer_yellow4 },
  ].filter((entry) => entry.links.length > 0)

  return (
    <>
      {links.map((entry) => (
        <FlowLinks
          key={`${entry.strokeColor}-${entry.links[0].id}`}
          activeFlowFocus={activeFlowFocus}
          activeRouteIds={activeRouteIds}
          flowKind={entry.flowKind}
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

function getCenterRouteIds(model: SankeyModel): { ammRouteIds: string[]; cowRouteIds: string[] } {
  return {
    ammRouteIds: getUniqueRouteIds([...model.sellLinks, ...model.buyLinks]),
    cowRouteIds: getUniqueRouteIds([...model.cowInLinks, ...model.cowOutLinks]),
  }
}

type CanvasTextureBackgroundProps = {
  width: number
  height: number
}

type CowNodeFactoryParams = {
  activeFlowFocus?: ActiveFlowFocus
  activeRouteIds?: string[]
  cowFlow?: CowFlowSummary
  cowRouteIds: string[]
  model: SankeyModel
  networkId: Network | undefined
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  showUsdValues: boolean
}

function getCowNode({
  activeFlowFocus,
  activeRouteIds,
  cowFlow,
  cowRouteIds,
  model,
  networkId,
  onRouteEnter,
  onRouteLeave,
  showUsdValues,
}: CowNodeFactoryParams): ReactNode {
  if (!cowFlow || model.cowY === undefined || model.cowHeight === undefined) {
    return null
  }

  return (
    <CowNode
      activeFlowFocus={activeFlowFocus}
      activeRouteIds={activeRouteIds}
      centerHeight={model.cowHeight}
      centerX={model.centerX}
      centerY={model.cowY}
      connectedRouteIds={cowRouteIds}
      estimatedLpFeeSavingsUsd={cowFlow.estimatedLpFeeSavingsUsd}
      matchedAmountLabel={cowFlow.matchedAmountLabel}
      matchedTokenAddress={cowFlow.tokenAddress}
      matchedAmountUsdValue={cowFlow.matchedAmountUsdValue}
      networkId={networkId}
      nodeWidth={model.nodeWidth}
      onRouteEnter={onRouteEnter}
      onRouteLeave={onRouteLeave}
      showUsdValues={showUsdValues}
    />
  )
}
