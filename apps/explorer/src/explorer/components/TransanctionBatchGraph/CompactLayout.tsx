import { type ReactNode, useCallback, useEffect, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { getBlockExplorerUrl } from '@cowprotocol/common-utils'
import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import {
  CenterDetailsContent,
  CenterDetailsKind,
  CenterDetailsRow,
  CenterDetailsValuePart,
  buildCenterDetailsContent,
} from './CompactLayout.centerDetails'
import { CowNode, RouteNode } from './CompactLayout.centerNodes'
import { ActiveFlowFocus, RouteSelection } from './CompactLayout.interactions'
import { FlowLinks } from './CompactLayout.links'
import { DESKTOP_CHART_WIDTH, MOBILE_CHART_WIDTH, createSankeyModel, SankeyModel } from './CompactLayout.model'
import { LeftNodes, RightNodes } from './CompactLayout.sideNodes'
import { CompactRoute, CowFlowSummary, ExecutionBreakdown, ExecutionHopEndpointKind } from './types'

import { Network } from '../../../types'

const Wrapper = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.8rem;

  ${Media.upToMedium()} {
    padding: 1.2rem 0.8rem 1.5rem;
  }
`

const Svg = styled.svg<{ $minWidth: number }>`
  display: block;
  width: 100%;
  min-width: ${({ $minWidth }): string => `${$minWidth}px`};
  border-radius: 0.8rem;
`

const DetailsModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.6rem;
  background: rgba(2, 4, 12, 0.66);
`

const DetailsModalCard = styled.div`
  width: min(1240px, calc(100vw - 2.4rem));
  max-width: min(1240px, calc(100vw - 2.4rem));
  height: min(92vh, 980px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid ${Color.explorer_border};
  background: rgba(11, 14, 31, 0.96);
  box-shadow: 0 22px 52px rgba(2, 5, 16, 0.62);
`

const DetailsModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem 0.8rem;
  border-bottom: 1px solid rgba(132, 143, 176, 0.28);
`

const DetailsModalTitle = styled.h3<{ $tone: CenterDetailsKind }>`
  margin: 0;
  font-size: 1.9rem;
  line-height: 1.2;
  font-weight: 700;
  color: ${({ $tone }): string => ($tone === 'cow' ? Color.explorer_yellow4 : Color.neutral100)};
`

const DetailsModalClose = styled.button`
  border: 1px solid rgba(132, 143, 176, 0.52);
  border-radius: 0.8rem;
  background: rgba(24, 30, 58, 0.92);
  color: ${Color.neutral100};
  font-size: 1.2rem;
  line-height: 1;
  font-weight: 600;
  padding: 0.6rem 0.9rem;
  cursor: pointer;

  &:hover {
    background: rgba(39, 47, 82, 0.92);
  }
`

const DetailsModalBody = styled.div`
  min-height: 0;
  display: block;
  padding: 1.1rem 1.2rem 1.35rem;
  overflow-y: auto;
  overscroll-behavior: contain;

  > * + * {
    margin-top: 1rem;
  }
`

const DetailsTableSurface = styled.div`
  border: 1px solid rgba(132, 143, 176, 0.28);
  border-radius: 0.8rem;
  overflow: hidden;
  background: rgba(9, 13, 32, 0.65);
`

const DetailsSummaryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`

const DetailsSummaryLabelCell = styled.th`
  width: 240px;
  padding: 0.75rem 0.8rem;
  text-align: left;
  vertical-align: top;
  font-size: 1.25rem;
  line-height: 1.35;
  font-weight: 600;
  color: rgba(214, 223, 255, 0.8);
  border-bottom: 1px solid rgba(132, 143, 176, 0.2);
`

const DetailsSummaryValueCell = styled.td`
  padding: 0.75rem 0.8rem;
  vertical-align: top;
  font-size: 1.45rem;
  line-height: 1.4;
  font-weight: 500;
  color: ${Color.neutral100};
  word-break: break-word;
  border-bottom: 1px solid rgba(132, 143, 176, 0.2);

  ${Media.upToSmall(false)} {
    font-size: 1.35rem;
  }
`

const DetailsSummaryRow = styled.tr`
  &:last-child ${DetailsSummaryLabelCell}, &:last-child ${DetailsSummaryValueCell} {
    border-bottom: 0;
  }
`

const DetailsHopsTableWrap = styled.div`
  border: 1px solid rgba(132, 143, 176, 0.28);
  border-radius: 0.8rem;
  overflow-x: auto;
  overflow-y: visible;
  background: rgba(9, 13, 32, 0.65);
`

const DetailsHopsTable = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
`

const DetailsHopsHeadCell = styled.th`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0.7rem 0.75rem;
  background: rgba(16, 21, 44, 0.96);
  text-align: left;
  font-size: 1.2rem;
  line-height: 1.25;
  font-weight: 700;
  color: rgba(226, 233, 255, 0.9);
  border-bottom: 1px solid rgba(132, 143, 176, 0.26);
`

const DetailsHopsRow = styled.tr`
  background: rgba(4, 8, 22, 0.54);

  &:nth-child(even) {
    background: rgba(8, 12, 30, 0.76);
  }

  &:hover {
    background: rgba(14, 21, 45, 0.9);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(132, 143, 176, 0.16);
  }
`

const DetailsHopsHopCell = styled.th`
  width: 88px;
  padding: 0.65rem 0.75rem;
  text-align: left;
  vertical-align: top;
  font-size: 1.2rem;
  line-height: 1.3;
  font-weight: 600;
  color: rgba(214, 223, 255, 0.8);
`

const DetailsHopLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
`

const DetailsHopColorDot = styled.span<{ $color: string }>`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
  background: ${({ $color }): string => $color};
  box-shadow: 0 0 0 1px rgba(12, 18, 36, 0.7);
`

const DetailsHopsValueCell = styled.td`
  padding: 0.65rem 0.75rem;
  vertical-align: top;
  font-size: 1.35rem;
  line-height: 1.35;
  font-weight: 500;
  color: ${Color.neutral100};
  word-break: break-word;
`

const DetailsModalLink = styled.a`
  color: ${Color.neutral100};
  text-decoration: underline;
  text-decoration-color: rgba(217, 227, 255, 0.45);
  text-underline-offset: 2px;

  &:hover {
    text-decoration-color: rgba(217, 227, 255, 0.75);
  }
`

const DetailsModalSectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.05rem;
  margin-bottom: 0.3rem;
`

const DetailsModalSectionTitle = styled.div`
  font-size: 1.3rem;
  line-height: 1.3;
  font-weight: 700;
  color: rgba(226, 233, 255, 0.92);
`

const DetailsMiniDagWrap = styled.div`
  border: 1px solid rgba(132, 143, 176, 0.28);
  border-radius: 0.8rem;
  overflow: hidden;
  background: rgba(8, 12, 28, 0.72);
`

const DetailsMiniDagSvg = styled.svg`
  display: block;
  width: 100%;
  height: 360px;
`

const DetailsGroupsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.65rem;
`

const DetailsGroupsPanel = styled.details`
  border: 1px solid rgba(132, 143, 176, 0.24);
  border-radius: 0.8rem;
  overflow: hidden;
  background: rgba(9, 13, 32, 0.62);
`

const DetailsGroupsPanelSummary = styled.summary`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  cursor: pointer;
  padding: 0.72rem 0.85rem;
  font-size: 1.3rem;
  line-height: 1.3;
  font-weight: 700;
  color: rgba(226, 233, 255, 0.92);
  list-style: none;
  user-select: none;
  background: rgba(16, 21, 44, 0.72);
  border-bottom: 1px solid rgba(132, 143, 176, 0.18);
  padding-left: 0.65rem;

  &::-webkit-details-marker {
    display: none;
  }

  &::before {
    content: '';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.45rem;
    height: 1.45rem;
    margin-right: 0.55rem;
    border-radius: 999px;
    border: 1px solid rgba(132, 143, 176, 0.4);
    background:
      linear-gradient(rgba(223, 232, 255, 0.92), rgba(223, 232, 255, 0.92)) center / 0.62rem 1px no-repeat,
      linear-gradient(rgba(223, 232, 255, 0.92), rgba(223, 232, 255, 0.92)) center / 1px 0.62rem no-repeat,
      rgba(21, 28, 54, 0.82);
    flex: 0 0 auto;
  }

  ${DetailsGroupsPanel}[open] &::before {
    background:
      linear-gradient(rgba(223, 232, 255, 0.92), rgba(223, 232, 255, 0.92)) center / 0.62rem 1px no-repeat,
      rgba(21, 28, 54, 0.82);
  }
`

const DetailsGroupsPanelMeta = styled.span`
  font-size: 1.15rem;
  line-height: 1.3;
  font-weight: 500;
  color: rgba(193, 205, 241, 0.8);
`

const DetailsGroupItem = styled.details`
  border: 1px solid rgba(132, 143, 176, 0.24);
  border-radius: 0.8rem;
  background: rgba(9, 13, 32, 0.6);
  overflow: hidden;
`

const DetailsGroupSummary = styled.summary`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  cursor: pointer;
  padding: 0.7rem 0.85rem;
  font-size: 1.3rem;
  line-height: 1.3;
  font-weight: 600;
  color: rgba(232, 238, 255, 0.94);
  list-style: none;
  user-select: none;
  background: rgba(16, 21, 44, 0.72);
  border-bottom: 1px solid rgba(132, 143, 176, 0.18);
  padding-left: 0.65rem;

  &::-webkit-details-marker {
    display: none;
  }

  &::before {
    content: '';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.35rem;
    height: 1.35rem;
    margin-right: 0.5rem;
    border-radius: 999px;
    border: 1px solid rgba(132, 143, 176, 0.4);
    background:
      linear-gradient(rgba(213, 224, 255, 0.92), rgba(213, 224, 255, 0.92)) center / 0.56rem 1px no-repeat,
      linear-gradient(rgba(213, 224, 255, 0.92), rgba(213, 224, 255, 0.92)) center / 1px 0.56rem no-repeat,
      rgba(21, 28, 54, 0.82);
    flex: 0 0 auto;
  }

  ${DetailsGroupItem}[open] &::before {
    background:
      linear-gradient(rgba(213, 224, 255, 0.92), rgba(213, 224, 255, 0.92)) center / 0.56rem 1px no-repeat,
      rgba(21, 28, 54, 0.82);
  }
`

const DetailsGroupMeta = styled.span`
  font-size: 1.15rem;
  line-height: 1.3;
  font-weight: 500;
  color: rgba(193, 205, 241, 0.8);
`

const DetailsGroupTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const DetailsGroupHeadCell = styled.th`
  padding: 0.52rem 0.7rem;
  text-align: left;
  font-size: 1.15rem;
  line-height: 1.2;
  font-weight: 700;
  color: rgba(210, 220, 248, 0.88);
  border-bottom: 1px solid rgba(132, 143, 176, 0.16);
`

const DetailsGroupCell = styled.td`
  padding: 0.52rem 0.7rem;
  vertical-align: top;
  font-size: 1.28rem;
  line-height: 1.3;
  font-weight: 500;
  color: rgba(236, 242, 255, 0.94);
`

const DetailsGroupRow = styled.tr`
  background: rgba(4, 8, 22, 0.54);

  &:nth-child(even) {
    background: rgba(8, 12, 30, 0.76);
  }

  &:hover {
    background: rgba(14, 21, 45, 0.9);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(132, 143, 176, 0.12);
  }
`

const EndpointBadge = styled.span<{ $kind: NonNullable<CenterDetailsValuePart['endpointKind']> }>`
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 1.1rem;
  line-height: 1.2;
  font-weight: 600;
  border: 1px solid
    ${({ $kind }): string =>
      $kind === 'settlement'
        ? 'rgba(140, 166, 255, 0.55)'
        : $kind === 'venue'
          ? 'rgba(112, 214, 175, 0.55)'
          : 'rgba(238, 188, 96, 0.55)'};
  color: ${({ $kind }): string =>
    $kind === 'settlement' ? 'rgba(168, 188, 255, 0.96)' : $kind === 'venue' ? 'rgba(132, 236, 194, 0.96)' : '#f2cc7d'};
  background: ${({ $kind }): string =>
    $kind === 'settlement'
      ? 'rgba(140, 166, 255, 0.12)'
      : $kind === 'venue'
        ? 'rgba(112, 214, 175, 0.12)'
        : 'rgba(238, 188, 96, 0.12)'};
`

type CompactLayoutProps = {
  routes: CompactRoute[]
  dexLabel: string
  dexAddress?: string
  networkId: Network | undefined
  hasPossibleCow: boolean
  cowFlow?: CowFlowSummary
  executionBreakdown?: ExecutionBreakdown
  showUsdValues: boolean
}

type CompactSankeyCanvasProps = {
  activeFlowFocus?: ActiveFlowFocus
  activeRouteIds?: string[]
  cowFlow?: CowFlowSummary
  executionBreakdown?: ExecutionBreakdown
  executionHopCount?: number
  dexAddress?: string
  dexLabel: string
  hideEdgeLabels: boolean
  model: SankeyModel
  networkId: Network | undefined
  onAmmEnter: (selection: RouteSelection) => void
  onCowEnter: (selection: RouteSelection) => void
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  onToggleCowDetails: () => void
  onToggleRouteDetails: () => void
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
  executionBreakdown?: ExecutionBreakdown
  executionHopCount?: number
  dexAddress?: string
  dexLabel: string
  model: SankeyModel
  networkId: Network | undefined
  onAmmEnter: (selection: RouteSelection) => void
  onCowEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  onToggleCowDetails: () => void
  onToggleRouteDetails: () => void
  routeExplorerLink?: string
  routeStroke: string
  showUsdValues: boolean
}

type BodyNodesProps = {
  activeFlowFocus?: ActiveFlowFocus
  activeRouteIds?: string[]
  cowFlow?: CowFlowSummary
  executionBreakdown?: ExecutionBreakdown
  executionHopCount?: number
  dexAddress?: string
  dexLabel: string
  model: SankeyModel
  networkId: Network | undefined
  onAmmEnter: (selection: RouteSelection) => void
  onCowEnter: (selection: RouteSelection) => void
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  onToggleCowDetails: () => void
  onToggleRouteDetails: () => void
  routeExplorerLink?: string
  routeStroke: string
  routes: CompactRoute[]
  showUsdValues: boolean
}

type CompactInteractionState = {
  activeFlowFocus?: ActiveFlowFocus
  activeRouteIds?: string[]
  onAmmEnter: (selection: RouteSelection) => void
  onCowEnter: (selection: RouteSelection) => void
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
}

type CenterDetailsState = {
  activeCenterDetails?: CenterDetailsKind
  onCloseCenterDetails: () => void
  onToggleCowDetails: () => void
  onToggleRouteDetails: () => void
}

function useCompactInteractionState(): CompactInteractionState {
  const [activeRouteIds, setActiveRouteIds] = useState<string[]>()
  const [activeFlowFocus, setActiveFlowFocus] = useState<ActiveFlowFocus>()
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

  return { activeFlowFocus, activeRouteIds, onAmmEnter, onCowEnter, onRouteEnter, onRouteLeave }
}

function useCenterDetailsState(): CenterDetailsState {
  const [activeCenterDetails, setActiveCenterDetails] = useState<CenterDetailsKind>()
  const onCloseCenterDetails = useCallback((): void => {
    setActiveCenterDetails(undefined)
  }, [])
  const onToggleCowDetails = useCallback((): void => {
    setActiveCenterDetails((current) => (current === 'cow' ? undefined : 'cow'))
  }, [])
  const onToggleRouteDetails = useCallback((): void => {
    setActiveCenterDetails((current) => (current === 'route' ? undefined : 'route'))
  }, [])

  return { activeCenterDetails, onCloseCenterDetails, onToggleCowDetails, onToggleRouteDetails }
}

export function CompactLayout({
  routes,
  dexLabel,
  dexAddress,
  networkId,
  hasPossibleCow,
  cowFlow,
  executionBreakdown,
  showUsdValues,
}: CompactLayoutProps): ReactNode {
  const { activeFlowFocus, activeRouteIds, onAmmEnter, onCowEnter, onRouteEnter, onRouteLeave } =
    useCompactInteractionState()
  const { activeCenterDetails, onCloseCenterDetails, onToggleCowDetails, onToggleRouteDetails } =
    useCenterDetailsState()
  const isMobile = useMediaQuery(Media.upToMedium(false))

  if (!routes.length) {
    return <Wrapper>No flow data available for compact mode.</Wrapper>
  }

  const model = createSankeyModel(routes, cowFlow, showUsdValues, isMobile)
  const routeExplorerLink = networkId && dexAddress ? getBlockExplorerUrl(networkId, 'contract', dexAddress) : undefined
  const routeStroke = hasPossibleCow ? Color.explorer_border : Color.explorer_borderPrimary
  const executionHopCount = executionBreakdown?.hops.length
  const centerDetailsContent = getCenterDetailsContent(
    activeCenterDetails,
    model,
    dexLabel,
    dexAddress,
    cowFlow,
    executionBreakdown,
    networkId,
    showUsdValues,
  )

  return (
    <>
      <Wrapper>
        <CompactSankeyCanvas
          activeFlowFocus={activeFlowFocus}
          activeRouteIds={activeRouteIds}
          cowFlow={cowFlow}
          executionBreakdown={executionBreakdown}
          executionHopCount={executionHopCount}
          dexAddress={dexAddress}
          dexLabel={dexLabel}
          hideEdgeLabels={isMobile}
          model={model}
          networkId={networkId}
          onAmmEnter={onAmmEnter}
          onCowEnter={onCowEnter}
          onRouteEnter={onRouteEnter}
          onRouteLeave={onRouteLeave}
          onToggleCowDetails={onToggleCowDetails}
          onToggleRouteDetails={onToggleRouteDetails}
          routeExplorerLink={routeExplorerLink}
          routeStroke={routeStroke}
          routes={routes}
          showUsdValues={showUsdValues}
        />
      </Wrapper>
      <CenterDetailsModal content={centerDetailsContent} onClose={onCloseCenterDetails} />
    </>
  )
}

type CenterDetailsModalProps = {
  content: CenterDetailsContent | undefined
  onClose: () => void
}

function CenterDetailsModal({ content, onClose }: CenterDetailsModalProps): ReactNode {
  const [hoveredMiniDagNodeKey, setHoveredMiniDagNodeKey] = useState<string>()

  useEffect(() => {
    if (!content) {
      return undefined
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return (): void => window.removeEventListener('keydown', onKeyDown)
  }, [content, onClose])

  useEffect(() => {
    setHoveredMiniDagNodeKey(undefined)
  }, [content])

  if (!content) {
    return null
  }

  const summaryRows = content.rows.filter((row) => row.section !== 'hop')
  const hopRows = content.rows.filter((row) => row.section === 'hop')
  const hopTableRows = hopRows.map(toHopTableRow)
  const endpointDisplayLabels = buildHopEndpointDisplayLabels(hopTableRows)

  return (
    <DetailsModalOverlay onClick={onClose}>
      <DetailsModalCard onClick={(event): void => event.stopPropagation()}>
        <DetailsModalHeader>
          <DetailsModalTitle $tone={content.tone}>{content.title}</DetailsModalTitle>
          <DetailsModalClose onClick={onClose} type="button">
            Close
          </DetailsModalClose>
        </DetailsModalHeader>
        <DetailsModalBody>
          <SummaryTable rows={summaryRows} />
          <TopologyPreview
            hopRows={hopTableRows}
            hoveredNodeKey={hoveredMiniDagNodeKey}
            setHoveredNodeKey={setHoveredMiniDagNodeKey}
            endpointDisplayLabels={endpointDisplayLabels}
          />
          <ExecutionHopsTable hopRows={hopTableRows} endpointDisplayLabels={endpointDisplayLabels} />
          <GroupedHops hopRows={hopTableRows} endpointDisplayLabels={endpointDisplayLabels} />
        </DetailsModalBody>
      </DetailsModalCard>
    </DetailsModalOverlay>
  )
}

type SummaryTableProps = { rows: CenterDetailsRow[] }

function SummaryTable({ rows }: SummaryTableProps): ReactNode {
  if (!rows.length) {
    return null
  }

  return (
    <DetailsTableSurface>
      <DetailsSummaryTable>
        <tbody>
          {rows.map((row) => (
            <DetailsSummaryRow key={row.key}>
              <DetailsSummaryLabelCell>{row.label}</DetailsSummaryLabelCell>
              <DetailsSummaryValueCell>
                <DetailsRowValue value={row.value} valueParts={row.valueParts} />
              </DetailsSummaryValueCell>
            </DetailsSummaryRow>
          ))}
        </tbody>
      </DetailsSummaryTable>
    </DetailsTableSurface>
  )
}

type ExecutionHopsTableProps = { hopRows: HopTableRow[]; endpointDisplayLabels: Record<string, string> }

function ExecutionHopsTable({ hopRows, endpointDisplayLabels }: ExecutionHopsTableProps): ReactNode {
  if (!hopRows.length) {
    return null
  }

  return (
    <>
      <DetailsModalSectionHeader>
        <DetailsModalSectionTitle>Execution hops</DetailsModalSectionTitle>
      </DetailsModalSectionHeader>
      <DetailsHopsTableWrap>
        <DetailsHopsTable>
          <thead>
            <tr>
              <DetailsHopsHeadCell scope="col">Hop</DetailsHopsHeadCell>
              <DetailsHopsHeadCell scope="col">From</DetailsHopsHeadCell>
              <DetailsHopsHeadCell scope="col">To</DetailsHopsHeadCell>
              <DetailsHopsHeadCell scope="col">Amount</DetailsHopsHeadCell>
            </tr>
          </thead>
          <tbody>
            {hopRows.map((row) => (
              <DetailsHopsRow key={row.key}>
                <DetailsHopsHopCell scope="row">
                  <DetailsHopLabel>
                    <DetailsHopColorDot $color={toMiniDagEdgeColor(row.from.endpointKind || 'unknown', row.hopIndex)} />
                    {row.hopLabel}
                  </DetailsHopLabel>
                </DetailsHopsHopCell>
                <DetailsHopsValueCell>
                  <HopEndpointCellValue
                    endpoint={row.from}
                    displayText={endpointDisplayLabels[getHopNodeKey(row.from)]}
                  />
                </DetailsHopsValueCell>
                <DetailsHopsValueCell>
                  <HopEndpointCellValue endpoint={row.to} displayText={endpointDisplayLabels[getHopNodeKey(row.to)]} />
                </DetailsHopsValueCell>
                <DetailsHopsValueCell>{row.amount}</DetailsHopsValueCell>
              </DetailsHopsRow>
            ))}
          </tbody>
        </DetailsHopsTable>
      </DetailsHopsTableWrap>
    </>
  )
}

type TopologyPreviewProps = {
  hopRows: HopTableRow[]
  hoveredNodeKey: string | undefined
  setHoveredNodeKey: (nodeKey: string | undefined) => void
  endpointDisplayLabels: Record<string, string>
}

function TopologyPreview({
  hopRows,
  hoveredNodeKey,
  setHoveredNodeKey,
  endpointDisplayLabels,
}: TopologyPreviewProps): ReactNode {
  if (!hopRows.length) {
    return null
  }

  const graph = buildMiniDag(hopRows)

  if (!graph.nodes.length || !graph.edges.length) {
    return null
  }

  const topologyFocus = getMiniDagFocus(graph, hoveredNodeKey)

  return (
    <>
      <DetailsModalSectionHeader>
        <DetailsModalSectionTitle>Topology preview</DetailsModalSectionTitle>
      </DetailsModalSectionHeader>
      <DetailsMiniDagWrap>
        <DetailsMiniDagSvg
          onMouseLeave={(): void => setHoveredNodeKey(undefined)}
          viewBox={`0 0 ${MINI_DAG_WIDTH} ${MINI_DAG_HEIGHT}`}
        >
          {graph.edges.map((edge, edgeIndex) => {
            const from = graph.nodesByKey.get(edge.fromKey)
            const to = graph.nodesByKey.get(edge.toKey)
            if (!from || !to) {
              return null
            }

            const isConnected = !topologyFocus.hasHover || topologyFocus.connectedEdgeIds.has(edge.id)

            return (
              <path
                key={edge.id}
                d={toMiniDagEdgePath(from.x, from.y, to.x, to.y)}
                fill="none"
                opacity={isConnected ? 0.92 : 0.16}
                stroke={toMiniDagEdgeColor(edge.kind, edgeIndex)}
                strokeWidth={2}
              />
            )
          })}
          {graph.nodes.map((node) => {
            const isConnected = !topologyFocus.hasHover || topologyFocus.connectedNodeKeys.has(node.key)

            return (
              <g key={node.key} onMouseEnter={(): void => setHoveredNodeKey(node.key)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  fill={toMiniDagNodeFill(node.kind)}
                  opacity={isConnected ? 1 : 0.22}
                  r={8}
                />
                <text
                  fill={isConnected ? 'rgba(227, 235, 255, 0.9)' : 'rgba(160, 171, 200, 0.42)'}
                  fontSize="12"
                  fontWeight={600}
                  textAnchor="middle"
                  x={node.x}
                  y={node.y + 22}
                >
                  {formatMiniDagLabel(endpointDisplayLabels[node.key] || node.label)}
                </text>
              </g>
            )
          })}
        </DetailsMiniDagSvg>
      </DetailsMiniDagWrap>
    </>
  )
}

function getMiniDagFocus(
  graph: MiniDagGraph,
  hoveredNodeKey: string | undefined,
): {
  connectedEdgeIds: Set<string>
  connectedNodeKeys: Set<string>
  hasHover: boolean
} {
  const connectedNodeKeys = new Set<string>()
  const connectedEdgeIds = new Set<string>()

  if (hoveredNodeKey) {
    connectedNodeKeys.add(hoveredNodeKey)

    graph.edges.forEach((edge) => {
      if (edge.fromKey === hoveredNodeKey || edge.toKey === hoveredNodeKey) {
        connectedEdgeIds.add(edge.id)
        connectedNodeKeys.add(edge.fromKey)
        connectedNodeKeys.add(edge.toKey)
      }
    })
  }

  return {
    connectedEdgeIds,
    connectedNodeKeys,
    hasHover: Boolean(hoveredNodeKey),
  }
}

type GroupedHopsProps = { hopRows: HopTableRow[]; endpointDisplayLabels: Record<string, string> }

function GroupedHops({ hopRows, endpointDisplayLabels }: GroupedHopsProps): ReactNode {
  if (!hopRows.length) {
    return null
  }

  const groupedRows = buildHopGroups(hopRows)

  if (!groupedRows.length) {
    return null
  }

  return (
    <>
      <DetailsModalSectionHeader>
        <DetailsModalSectionTitle>Grouped paths</DetailsModalSectionTitle>
      </DetailsModalSectionHeader>
      <DetailsGroupsPanel open>
        <DetailsGroupsPanelSummary>
          <span>Expand grouped paths</span>
          <DetailsGroupsPanelMeta>{`${groupedRows.length} source groups`}</DetailsGroupsPanelMeta>
        </DetailsGroupsPanelSummary>
        <DetailsGroupsStack>
          {groupedRows.map((group) => (
            <DetailsGroupItem key={group.key}>
              <DetailsGroupSummary>
                <span>{endpointDisplayLabels[group.key] || group.label}</span>
                <DetailsGroupMeta>{`${group.rows.length} hops · ${group.uniqueTargets} targets`}</DetailsGroupMeta>
              </DetailsGroupSummary>
              <DetailsGroupTable>
                <thead>
                  <tr>
                    <DetailsGroupHeadCell>Hop</DetailsGroupHeadCell>
                    <DetailsGroupHeadCell>To</DetailsGroupHeadCell>
                    <DetailsGroupHeadCell>Amount</DetailsGroupHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row) => (
                    <DetailsGroupRow key={`${group.key}-${row.key}`}>
                      <DetailsGroupCell>{row.hopLabel}</DetailsGroupCell>
                      <DetailsGroupCell>
                        <HopEndpointCellValue
                          endpoint={row.to}
                          displayText={endpointDisplayLabels[getHopNodeKey(row.to)]}
                        />
                      </DetailsGroupCell>
                      <DetailsGroupCell>{row.amount}</DetailsGroupCell>
                    </DetailsGroupRow>
                  ))}
                </tbody>
              </DetailsGroupTable>
            </DetailsGroupItem>
          ))}
        </DetailsGroupsStack>
      </DetailsGroupsPanel>
    </>
  )
}

function getCenterDetailsContent(
  activeCenterDetails: CenterDetailsKind | undefined,
  model: SankeyModel,
  dexLabel: string,
  dexAddress: string | undefined,
  cowFlow: CowFlowSummary | undefined,
  executionBreakdown: ExecutionBreakdown | undefined,
  networkId: Network | undefined,
  showUsdValues: boolean,
): CenterDetailsContent | undefined {
  if (!activeCenterDetails) {
    return undefined
  }

  return buildCenterDetailsContent({
    cowFlow,
    dexAddress,
    dexLabel,
    executionBreakdown,
    kind: activeCenterDetails,
    model,
    networkId,
    showUsdValues,
  })
}

type DetailsRowValueProps = { value: string; valueParts: CenterDetailsValuePart[] | undefined }

function DetailsRowValue({ value, valueParts }: DetailsRowValueProps): ReactNode {
  if (!valueParts?.length) {
    return value
  }

  return valueParts.map((part) => (
    <span key={part.key}>
      {part.href ? (
        <DetailsModalLink href={part.href} rel="noopener noreferrer" target="_blank">
          {part.text}
        </DetailsModalLink>
      ) : (
        part.text
      )}
      {part.endpointKind && part.endpointKind !== 'unknown' && (
        <EndpointBadge $kind={part.endpointKind}>{toEndpointBadgeLabel(part.endpointKind)}</EndpointBadge>
      )}
    </span>
  ))
}

type HopEndpointCell = {
  text: string
  href?: string
  address?: string
  endpointKind?: ExecutionHopEndpointKind
}

type HopTableRow = {
  key: string
  hopLabel: string
  hopIndex: number
  from: HopEndpointCell
  to: HopEndpointCell
  amount: string
}

function toHopTableRow(row: CenterDetailsRow): HopTableRow {
  const fromPart = row.valueParts?.[0]
  const toPart = row.valueParts?.[2]
  const amountPart = row.valueParts?.find((part) => part.key.includes('amount'))

  if (fromPart && toPart && amountPart) {
    return {
      key: row.key,
      hopLabel: row.label,
      hopIndex: getHopIndex(row.label),
      from: {
        text: fromPart.text,
        href: fromPart.href,
        address: getHopAddressFromPart(fromPart, 'from'),
        endpointKind: fromPart.endpointKind,
      },
      to: {
        text: toPart.text,
        href: toPart.href,
        address: getHopAddressFromPart(toPart, 'to'),
        endpointKind: toPart.endpointKind,
      },
      amount: amountPart.text,
    }
  }

  const [flowPart, amount = ''] = row.value.split(': ')
  const [from = 'unknown', to = 'unknown'] = flowPart.split(' -> ')

  return {
    key: row.key,
    hopLabel: row.label,
    hopIndex: getHopIndex(row.label),
    from: { text: from },
    to: { text: to },
    amount,
  }
}

function getHopIndex(hopLabel: string): number {
  const parsed = Number(hopLabel.replace(/\D/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed - 1 : 0
}

function getHopAddressFromPart(part: CenterDetailsValuePart, direction: 'from' | 'to'): string | undefined {
  const prefix = `${direction}-`
  return part.key.startsWith(prefix) ? part.key.slice(prefix.length) : undefined
}

type HopEndpointCellValueProps = { endpoint: HopEndpointCell; displayText?: string }

function HopEndpointCellValue({ endpoint, displayText }: HopEndpointCellValueProps): ReactNode {
  const text = displayText || endpoint.text

  return (
    <span>
      {endpoint.href ? (
        <DetailsModalLink href={endpoint.href} rel="noopener noreferrer" target="_blank">
          {text}
        </DetailsModalLink>
      ) : (
        text
      )}
      {endpoint.endpointKind && endpoint.endpointKind !== 'unknown' && (
        <EndpointBadge $kind={endpoint.endpointKind}>{toEndpointBadgeLabel(endpoint.endpointKind)}</EndpointBadge>
      )}
    </span>
  )
}

function toEndpointBadgeLabel(kind: NonNullable<CenterDetailsValuePart['endpointKind']>): string {
  switch (kind) {
    case 'settlement':
      return 'settlement'
    case 'venue':
      return 'external contract'
    case 'special-flow':
      return 'special'
    case 'unknown':
      return 'unknown'
  }
}

type MiniDagNode = {
  key: string
  label: string
  kind: ExecutionHopEndpointKind
  x: number
  y: number
}

type MiniDagEdge = {
  id: string
  fromKey: string
  toKey: string
  kind: ExecutionHopEndpointKind
}

type MiniDagGraph = {
  edges: MiniDagEdge[]
  nodes: MiniDagNode[]
  nodesByKey: Map<string, MiniDagNode>
}

type MiniDagNodeSeed = {
  key: string
  label: string
  kind: ExecutionHopEndpointKind
  fromCount: number
  toCount: number
  order: number
  firstSeen: number
  lastSeen: number
}

type HopGroup = {
  key: string
  label: string
  rows: HopTableRow[]
  uniqueTargets: number
}

const MINI_DAG_WIDTH = 960
const MINI_DAG_HEIGHT = 360
const MINI_DAG_PADDING_X = 92
const MINI_DAG_PADDING_Y = 48
const MINI_DAG_CURVE = 92
const MINI_DAG_BUCKETS = 7
const MINI_DAG_EDGE_PALETTE = [
  '#8FA5E7',
  '#78D7B7',
  '#F2CF73',
  '#D99CFF',
  '#72D7F0',
  '#F4A48F',
  '#9DDFA0',
  '#B5C1FF',
  '#FFBE8A',
  '#83E8D3',
  '#E9A1CF',
  '#A6E3CF',
] as const
const MINI_DAG_EDGE_KIND_OFFSETS: Record<ExecutionHopEndpointKind, number> = {
  settlement: 0,
  venue: 1,
  'special-flow': 2,
  unknown: 3,
}

function buildMiniDag(hopRows: HopTableRow[]): MiniDagGraph {
  const nodes = new Map<string, MiniDagNodeSeed>()
  const edges: MiniDagEdge[] = []

  hopRows.forEach((row, index) => {
    const hopOrder = index + 1
    const fromKey = getHopNodeKey(row.from)
    const toKey = getHopNodeKey(row.to)

    touchMiniDagNode(nodes, fromKey, row.from, hopOrder)
    touchMiniDagNode(nodes, toKey, row.to, hopOrder)

    const fromNode = nodes.get(fromKey)
    const toNode = nodes.get(toKey)

    if (fromNode) {
      fromNode.fromCount += 1
      fromNode.firstSeen = Math.min(fromNode.firstSeen, hopOrder)
      fromNode.lastSeen = Math.max(fromNode.lastSeen, hopOrder)
    }
    if (toNode) {
      toNode.toCount += 1
      toNode.firstSeen = Math.min(toNode.firstSeen, hopOrder)
      toNode.lastSeen = Math.max(toNode.lastSeen, hopOrder)
    }

    edges.push({ id: row.key, fromKey, toKey, kind: row.from.endpointKind || 'unknown' })
  })

  const laidOutNodes = layoutMiniDagNodes(Array.from(nodes.values()))
  const nodesByKey = new Map(laidOutNodes.map((node) => [node.key, node]))

  return { edges, nodes: laidOutNodes, nodesByKey }
}

function touchMiniDagNode(
  nodes: Map<string, MiniDagNodeSeed>,
  key: string,
  endpoint: HopEndpointCell,
  order: number,
): void {
  if (nodes.has(key)) {
    return
  }

  nodes.set(key, {
    key,
    label: endpoint.text || 'unknown',
    kind: endpoint.endpointKind || 'unknown',
    fromCount: 0,
    toCount: 0,
    order,
    firstSeen: order,
    lastSeen: order,
  })
}

function layoutMiniDagNodes(nodes: MiniDagNodeSeed[]): MiniDagNode[] {
  const buckets: MiniDagNodeSeed[][] = Array.from({ length: MINI_DAG_BUCKETS }, () => [])
  const middleBucket = Math.floor(MINI_DAG_BUCKETS / 2)
  const maxSeen = Math.max(...nodes.map((node) => node.lastSeen), 1)

  nodes.forEach((node) => {
    let bucketIndex: number

    if (node.kind === 'settlement') {
      bucketIndex = middleBucket
    } else {
      const stage = (node.firstSeen + node.lastSeen) / 2 / maxSeen
      bucketIndex = clampNumber(Math.round(stage * (MINI_DAG_BUCKETS - 1)), 0, MINI_DAG_BUCKETS - 1)

      if (bucketIndex === middleBucket) {
        const balance = node.fromCount - node.toCount
        bucketIndex = balance >= 0 ? middleBucket - 1 : middleBucket + 1
      }
    }

    buckets[clampNumber(bucketIndex, 0, MINI_DAG_BUCKETS - 1)].push(node)
  })

  buckets.forEach((bucket) =>
    bucket.sort((a, b) => {
      const balanceA = Math.abs(a.fromCount - a.toCount)
      const balanceB = Math.abs(b.fromCount - b.toCount)

      if (balanceA !== balanceB) {
        return balanceB - balanceA
      }

      return a.order - b.order
    }),
  )

  return buckets.flatMap((bucket, index) => {
    const x = MINI_DAG_PADDING_X + (index / (MINI_DAG_BUCKETS - 1)) * (MINI_DAG_WIDTH - MINI_DAG_PADDING_X * 2)

    return bucket.map((node, nodeIndex) => ({
      key: node.key,
      label: node.label,
      kind: node.kind,
      x,
      y: getMiniDagNodeY(nodeIndex, bucket.length),
    }))
  })
}

function buildHopEndpointDisplayLabels(hopRows: HopTableRow[]): Record<string, string> {
  const candidates: Array<{ key: string; label: string }> = []

  hopRows.forEach((row) => {
    candidates.push({ key: getHopNodeKey(row.from), label: row.from.text })
    candidates.push({ key: getHopNodeKey(row.to), label: row.to.text })
  })

  return buildDistinctEndpointLabels(candidates)
}

function buildDistinctEndpointLabels(items: Array<{ key: string; label: string }>): Record<string, string> {
  const uniqueByKey = new Map<string, string>()

  items.forEach((item) => {
    if (!uniqueByKey.has(item.key)) {
      uniqueByKey.set(item.key, item.label)
    }
  })

  const byLabel = new Map<string, Array<{ key: string; label: string }>>()
  const displayByKey: Record<string, string> = {}

  uniqueByKey.forEach((label, key) => {
    const labelKey = label.toLowerCase()
    const list = byLabel.get(labelKey)

    if (list) {
      list.push({ key, label })
    } else {
      byLabel.set(labelKey, [{ key, label }])
    }
  })

  byLabel.forEach((group) => {
    if (group.length === 1) {
      const [single] = group
      displayByKey[single.key] = single.label
      return
    }

    group.forEach((node, index) => {
      displayByKey[node.key] = isAddressKey(node.key)
        ? `${node.label} · ${shortAddress(node.key)}`
        : `${node.label} ${index + 1}`
    })
  })

  return displayByKey
}

function isAddressKey(value: string): boolean {
  return /^0x[a-f0-9]{40}$/i.test(value)
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function getMiniDagNodeY(index: number, count: number): number {
  if (count <= 1) {
    return MINI_DAG_HEIGHT / 2
  }

  const usableHeight = MINI_DAG_HEIGHT - MINI_DAG_PADDING_Y * 2
  return MINI_DAG_PADDING_Y + (usableHeight * index) / (count - 1)
}

function getHopNodeKey(endpoint: HopEndpointCell): string {
  return endpoint.address ? endpoint.address.toLowerCase() : endpoint.text.toLowerCase()
}

function toMiniDagEdgePath(fromX: number, fromY: number, toX: number, toY: number): string {
  if (Math.abs(fromX - toX) < 0.5) {
    const sideCurve = MINI_DAG_CURVE * 0.55
    return `M ${fromX} ${fromY} C ${fromX + sideCurve} ${fromY} ${toX + sideCurve} ${toY} ${toX} ${toY}`
  }

  return `M ${fromX} ${fromY} C ${fromX + MINI_DAG_CURVE} ${fromY} ${toX - MINI_DAG_CURVE} ${toY} ${toX} ${toY}`
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function toMiniDagEdgeColor(kind: ExecutionHopEndpointKind, index: number): string {
  const offset = MINI_DAG_EDGE_KIND_OFFSETS[kind]
  return MINI_DAG_EDGE_PALETTE[(index + offset) % MINI_DAG_EDGE_PALETTE.length]
}

function toMiniDagNodeFill(kind: ExecutionHopEndpointKind): string {
  switch (kind) {
    case 'settlement':
      return '#6f84d2'
    case 'venue':
      return '#4dbd9b'
    case 'special-flow':
      return '#d7a83d'
    case 'unknown':
      return '#7783a7'
  }
}

function formatMiniDagLabel(label: string): string {
  if (label.length <= 20) {
    return label
  }

  return `${label.slice(0, 10)}...${label.slice(-6)}`
}

function buildHopGroups(hopRows: HopTableRow[]): HopGroup[] {
  const groups = new Map<string, HopGroup>()

  hopRows.forEach((row) => {
    const key = getHopNodeKey(row.from)
    const existing = groups.get(key)

    if (existing) {
      existing.rows.push(row)
      existing.uniqueTargets = new Set(existing.rows.map((hop) => getHopNodeKey(hop.to))).size
      return
    }

    groups.set(key, {
      key,
      label: row.from.text,
      rows: [row],
      uniqueTargets: 1,
    })
  })

  return Array.from(groups.values())
}

function CompactSankeyCanvas({
  activeFlowFocus,
  activeRouteIds,
  cowFlow,
  executionBreakdown,
  executionHopCount,
  dexAddress,
  dexLabel,
  hideEdgeLabels,
  model,
  networkId,
  onAmmEnter,
  onCowEnter,
  onRouteEnter,
  onRouteLeave,
  onToggleCowDetails,
  onToggleRouteDetails,
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
      <BodyNodes
        activeFlowFocus={activeFlowFocus}
        activeRouteIds={activeRouteIds}
        cowFlow={cowFlow}
        executionBreakdown={executionBreakdown}
        executionHopCount={executionHopCount}
        dexAddress={dexAddress}
        dexLabel={dexLabel}
        model={model}
        networkId={networkId}
        onAmmEnter={onAmmEnter}
        onCowEnter={onCowEnter}
        onRouteEnter={onRouteEnter}
        onRouteLeave={onRouteLeave}
        onToggleCowDetails={onToggleCowDetails}
        onToggleRouteDetails={onToggleRouteDetails}
        routeExplorerLink={routeExplorerLink}
        routeStroke={routeStroke}
        routes={routes}
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

function BodyNodes({
  activeFlowFocus,
  activeRouteIds,
  cowFlow,
  executionBreakdown,
  executionHopCount,
  dexAddress,
  dexLabel,
  model,
  networkId,
  onAmmEnter,
  onCowEnter,
  onRouteEnter,
  onRouteLeave,
  onToggleCowDetails,
  onToggleRouteDetails,
  routeExplorerLink,
  routeStroke,
  routes,
  showUsdValues,
}: BodyNodesProps): ReactNode {
  return (
    <>
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
        executionBreakdown={executionBreakdown}
        executionHopCount={executionHopCount}
        dexAddress={dexAddress}
        dexLabel={dexLabel}
        model={model}
        networkId={networkId}
        onAmmEnter={onAmmEnter}
        onCowEnter={onCowEnter}
        onRouteLeave={onRouteLeave}
        onToggleCowDetails={onToggleCowDetails}
        onToggleRouteDetails={onToggleRouteDetails}
        routeExplorerLink={routeExplorerLink}
        routeStroke={routeStroke}
        showUsdValues={showUsdValues}
      />
    </>
  )
}

function CompactCenterNodes({
  activeFlowFocus,
  activeRouteIds,
  cowFlow,
  executionBreakdown,
  executionHopCount,
  dexAddress,
  dexLabel,
  model,
  networkId,
  onAmmEnter,
  onCowEnter,
  onRouteLeave,
  onToggleCowDetails,
  onToggleRouteDetails,
  routeExplorerLink,
  routeStroke,
  showUsdValues,
}: CompactCenterNodesProps): ReactNode {
  const { ammRouteIds, cowRouteIds } = getCenterRouteIds(model)

  return (
    <>
      <CowNodeConditional
        activeFlowFocus={activeFlowFocus}
        activeRouteIds={activeRouteIds}
        cowFlow={cowFlow}
        cowRouteIds={cowRouteIds}
        model={model}
        networkId={networkId}
        onRouteEnter={onCowEnter}
        onRouteLeave={onRouteLeave}
        onToggleDetails={onToggleCowDetails}
        showUsdValues={showUsdValues}
      />
      <RouteNode
        activeFlowFocus={activeFlowFocus}
        activeRouteIds={activeRouteIds}
        centerHeight={model.routeHeight}
        centerX={model.centerX}
        centerY={model.routeY}
        connectedRouteIds={ammRouteIds}
        dexAddress={dexAddress}
        dexLabel={dexLabel}
        executionBreakdown={executionBreakdown}
        executionHopCount={executionHopCount}
        nodeWidth={model.nodeWidth}
        onRouteEnter={onAmmEnter}
        onRouteLeave={onRouteLeave}
        onToggleDetails={onToggleRouteDetails}
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

type CowNodeConditionalProps = {
  activeFlowFocus?: ActiveFlowFocus
  activeRouteIds?: string[]
  cowFlow?: CowFlowSummary
  cowRouteIds: string[]
  model: SankeyModel
  networkId: Network | undefined
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  onToggleDetails: () => void
  showUsdValues: boolean
}

function CowNodeConditional({
  activeFlowFocus,
  activeRouteIds,
  cowFlow,
  cowRouteIds,
  model,
  networkId,
  onRouteEnter,
  onRouteLeave,
  onToggleDetails,
  showUsdValues,
}: CowNodeConditionalProps): ReactNode {
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
      onToggleDetails={onToggleDetails}
      showUsdValues={showUsdValues}
    />
  )
}
