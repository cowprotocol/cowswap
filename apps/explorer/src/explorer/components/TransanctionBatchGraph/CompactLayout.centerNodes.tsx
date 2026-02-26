import { type ReactNode, useState } from 'react'

import { Color } from '@cowprotocol/ui'

import { getExecutionSourceEndpoints, getSingleSpecialFlowLabel } from './CompactLayout.centerDetails'
import { ActiveFlowFocus, hasRouteOverlap, RouteSelection } from './CompactLayout.interactions'
import { computeCowTextLayout, formatAmountWithUsd, formatCowSavingsLabel, getTokenLogo } from './CompactLayout.visuals'
import { ExecutionBreakdown, ExecutionHopEndpointKind, SETTLEMENT_RESIDUAL_LABEL } from './types'

import CowProtocolIcon from '../../../assets/img/CoW-protocol.svg'
import { Network } from '../../../types'
import { abbreviateString } from '../../../utils'

const GLASS_CARD_FILL = 'rgba(13, 16, 34, 0.9)'
const CARD_SHEEN_FILL = 'rgba(255, 255, 255, 0.055)'
const CARD_TEXT_SECONDARY = 'rgba(229, 235, 255, 0.68)'
const ROUTE_ADDRESS_TEXT = 'rgba(214, 223, 255, 0.62)'
const DETAILS_BADGE_FILL = 'rgba(15, 19, 40, 0.88)'
const DETAILS_BADGE_STROKE = 'rgba(229, 235, 255, 0.42)'
const DETAILS_BADGE_TEXT = 'rgba(229, 235, 255, 0.88)'

type RouteNodeProps = {
  activeFlowFocus?: ActiveFlowFocus
  activeRouteIds?: string[]
  centerX: number
  centerY: number
  centerHeight: number
  nodeWidth: number
  connectedRouteIds: string[]
  routeStroke: string
  dexLabel: string
  dexAddress?: string
  executionBreakdown?: ExecutionBreakdown
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  onToggleDetails?: () => void
  routeExplorerLink?: string
  executionHopCount?: number
}

export function RouteNode({
  activeFlowFocus,
  activeRouteIds,
  centerX,
  centerY,
  centerHeight,
  nodeWidth,
  connectedRouteIds,
  routeStroke,
  dexLabel,
  dexAddress,
  executionBreakdown,
  onRouteEnter,
  onRouteLeave,
  onToggleDetails,
  routeExplorerLink,
  executionHopCount,
}: RouteNodeProps): ReactNode {
  const opacity = getNodeOpacity(activeFlowFocus, activeRouteIds, connectedRouteIds, 'amm')
  const isSettlementResidual = dexLabel === SETTLEMENT_RESIDUAL_LABEL
  const hasExecutionBreakdown = Boolean(
    executionBreakdown && (executionBreakdown.hops.length || executionBreakdown.venues.length),
  )
  const borderColor = routeStroke === Color.explorer_yellow4 ? Color.explorer_border : routeStroke
  const addressLines = getRouteDetailLines(isSettlementResidual, dexLabel, dexAddress, executionBreakdown)
  const addressTextY = centerY + centerHeight - 16 - Math.max(addressLines.length - 1, 0) * 13
  const metricsY = addressTextY - 18
  const routeHeaderLogo = CowProtocolIcon
  const titleLabel = 'internal routing'
  const headerLabel = 'CoW Protocol'
  const routeHeaderX = routeHeaderLogo ? centerX + 34 : centerX + 14

  return (
    <g
      onMouseEnter={(): void => onRouteEnter(connectedRouteIds)}
      onMouseLeave={onRouteLeave}
      style={{ cursor: 'default' }}
    >
      <rect
        fill={GLASS_CARD_FILL}
        height={centerHeight}
        opacity={opacity}
        rx="12"
        stroke={borderColor}
        strokeWidth="1.2"
        style={{
          backdropFilter: 'blur(8px)',
          transition: 'opacity 160ms ease',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        width={nodeWidth}
        x={centerX}
        y={centerY}
      />
      <rect fill={CARD_SHEEN_FILL} height={32} opacity={opacity} rx="12" width={nodeWidth} x={centerX} y={centerY} />
      {routeHeaderLogo ? <RouteHeaderLogoBadge centerX={centerX} centerY={centerY} logo={routeHeaderLogo} /> : null}
      <DetailsHintBadge onClick={onToggleDetails} x={centerX + nodeWidth - 16} y={centerY + 16} />
      <RouteNodeTextBlock
        addressLines={addressLines}
        addressTextY={addressTextY}
        executionHopCount={executionHopCount}
        headerLabel={headerLabel}
        headerX={routeHeaderX}
        metricsY={metricsY}
        routeExplorerLink={hasExecutionBreakdown ? undefined : routeExplorerLink}
        titleLabel={titleLabel}
        x={centerX + 14}
        y={centerY + 20}
      />
    </g>
  )
}

type RouteNodeTextBlockProps = {
  x: number
  y: number
  headerX: number
  headerLabel: string
  titleLabel: string
  metricsY: number
  addressTextY: number
  addressLines: string[]
  routeExplorerLink?: string
  executionHopCount?: number
}

function RouteNodeTextBlock({
  x,
  y,
  headerX,
  headerLabel,
  titleLabel,
  metricsY,
  addressTextY,
  addressLines,
  routeExplorerLink,
  executionHopCount,
}: RouteNodeTextBlockProps): ReactNode {
  return (
    <>
      <text x={x} y={y}>
        <tspan fill={CARD_TEXT_SECONDARY} fontSize="11.5" x={headerX}>
          {headerLabel}
        </tspan>
        <tspan dy="38" fill={Color.neutral100} fontSize="18" fontWeight="700" x={x}>
          {titleLabel}
        </tspan>
      </text>
      {executionHopCount !== undefined ? (
        <text fill={CARD_TEXT_SECONDARY} fontSize="12" x={x} y={metricsY}>
          {`settlement hops: ${executionHopCount}`}
        </text>
      ) : null}
      {addressLines.length ? (
        <RouteAddressLabel lines={addressLines} fontSize={12.5} href={routeExplorerLink} x={x} y={addressTextY} />
      ) : null}
    </>
  )
}

type CowNodeProps = {
  activeFlowFocus?: ActiveFlowFocus
  activeRouteIds?: string[]
  centerX: number
  centerY: number
  centerHeight: number
  nodeWidth: number
  connectedRouteIds: string[]
  matchedAmountLabel: string
  matchedTokenAddress?: string
  matchedAmountUsdValue?: number
  estimatedLpFeeSavingsUsd: number
  networkId: Network | undefined
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  onToggleDetails?: () => void
  showUsdValues: boolean
}

export function CowNode({
  activeFlowFocus,
  activeRouteIds,
  centerX,
  centerY,
  centerHeight,
  nodeWidth,
  connectedRouteIds,
  matchedAmountLabel,
  matchedTokenAddress,
  matchedAmountUsdValue,
  estimatedLpFeeSavingsUsd,
  networkId,
  onRouteEnter,
  onRouteLeave,
  onToggleDetails,
  showUsdValues,
}: CowNodeProps): ReactNode {
  const prefersReducedMotion = usePrefersReducedMotion()
  const matchedLabel = showUsdValues
    ? formatAmountWithUsd(matchedAmountLabel, matchedAmountUsdValue, true)
    : matchedAmountLabel
  const savingsLabel = formatCowSavingsLabel(estimatedLpFeeSavingsUsd)
  const opacity = getNodeOpacity(activeFlowFocus, activeRouteIds, connectedRouteIds, 'cow')
  const glowFilterId = `cow-node-glow-${Math.round(centerX)}-${Math.round(centerY)}`
  const matchedTokenLogo = matchedTokenAddress ? getTokenLogo(matchedTokenAddress, networkId) : undefined

  return (
    <g
      onMouseEnter={(): void => onRouteEnter(connectedRouteIds)}
      onMouseLeave={onRouteLeave}
      style={{ cursor: 'default' }}
    >
      <CowNodeBackground
        centerHeight={centerHeight}
        centerX={centerX}
        centerY={centerY}
        glowFilterId={glowFilterId}
        nodeWidth={nodeWidth}
        opacity={opacity}
        prefersReducedMotion={prefersReducedMotion}
      />
      <CowNodeText
        centerX={centerX}
        centerY={centerY}
        matchedLabel={matchedLabel}
        matchedTokenLogo={matchedTokenLogo}
        nodeWidth={nodeWidth}
        savingsLabel={savingsLabel}
      />
      <DetailsHintBadge onClick={onToggleDetails} x={centerX + nodeWidth - 16} y={centerY + 16} />
    </g>
  )
}

function getNodeOpacity(
  activeFlowFocus: ActiveFlowFocus | undefined,
  activeRouteIds: string[] | undefined,
  connectedRouteIds: string[],
  nodeKind: 'cow' | 'amm',
): number {
  const baseOpacity = hasRouteOverlap(activeRouteIds, connectedRouteIds) ? 1 : 0.3

  if (!activeFlowFocus || activeFlowFocus === 'route') {
    return baseOpacity
  }

  return activeFlowFocus === nodeKind ? baseOpacity : Math.min(baseOpacity, 0.22)
}

function getRouteDetailLines(
  isSettlementResidual: boolean,
  dexLabel: string,
  dexAddress: string | undefined,
  executionBreakdown: ExecutionBreakdown | undefined,
): string[] {
  if (executionBreakdown && (executionBreakdown.hops.length || executionBreakdown.venues.length)) {
    return getExecutionMixTreeLines(executionBreakdown)
  }

  if (isSettlementResidual) {
    if (!executionBreakdown) {
      return []
    }

    const sources = getExecutionSourceEndpoints(executionBreakdown)
    if (!sources.length) {
      return []
    }

    return splitRouteSourceLines(
      `liquidity sources: ${sources.length} external contract${sources.length === 1 ? '' : 's'}`,
    )
  }

  const routeSourceLabel = dexAddress ? `${dexLabel} · ${abbreviateString(dexAddress, 8, 6)}` : dexLabel
  return splitRouteSourceLines(routeSourceLabel)
}

type CowNodeBackgroundProps = {
  centerHeight: number
  centerX: number
  centerY: number
  glowFilterId: string
  nodeWidth: number
  opacity: number
  prefersReducedMotion: boolean
}

function CowNodeBackground({
  centerHeight,
  centerX,
  centerY,
  glowFilterId,
  nodeWidth,
  opacity,
  prefersReducedMotion,
}: CowNodeBackgroundProps): ReactNode {
  const glowMinOpacity = opacity * 0.08
  const glowMaxOpacity = opacity * 0.15

  return (
    <>
      <defs>
        <filter height="170%" id={glowFilterId} width="170%" x="-35%" y="-35%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <rect
        fill="rgba(240, 185, 11, 0.7)"
        filter={`url(#${glowFilterId})`}
        height={centerHeight}
        opacity={glowMinOpacity}
        rx="12"
        width={nodeWidth}
        x={centerX}
        y={centerY}
      >
        {!prefersReducedMotion ? (
          <animate
            attributeName="opacity"
            dur="8s"
            repeatCount="indefinite"
            values={`${glowMinOpacity};${glowMaxOpacity};${glowMinOpacity}`}
          />
        ) : null}
      </rect>
      <rect
        fill={GLASS_CARD_FILL}
        height={centerHeight}
        opacity={opacity}
        rx="12"
        stroke={Color.explorer_yellow4}
        strokeWidth="2"
        style={{
          backdropFilter: 'blur(8px)',
          filter: 'drop-shadow(0 0 14px rgba(240, 185, 11, 0.22))',
          transition: 'opacity 160ms ease',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        width={nodeWidth}
        x={centerX}
        y={centerY}
      />
      <rect fill={CARD_SHEEN_FILL} height={32} opacity={opacity} rx="12" width={nodeWidth} x={centerX} y={centerY} />
    </>
  )
}

type CowNodeTextProps = {
  centerX: number
  centerY: number
  matchedLabel: string
  matchedTokenLogo?: string
  nodeWidth: number
  savingsLabel: string
}

function CowNodeText({
  centerX,
  centerY,
  matchedLabel,
  matchedTokenLogo,
  nodeWidth,
  savingsLabel,
}: CowNodeTextProps): ReactNode {
  const layout = computeCowTextLayout(matchedLabel, savingsLabel, !!matchedTokenLogo, nodeWidth)
  const textLeftX = centerX + 14
  const amountX = matchedTokenLogo ? centerX + 36 : centerX + 14
  const amountIconClipId = `cow-amount-token-clip-${Math.round(centerX)}-${Math.round(centerY)}`

  return (
    <g>
      <image height="16" href={CowProtocolIcon} width="16" x={textLeftX} y={centerY + 10} />
      <text x={centerX + 38} y={centerY + 22}>
        <tspan fill={Color.explorer_yellow4} fontSize="13" fontWeight="600">
          CoW Match
        </tspan>
      </text>
      {matchedTokenLogo ? (
        <CowMatchedTokenBadge
          centerX={centerX}
          centerY={centerY}
          iconClipId={amountIconClipId}
          logo={matchedTokenLogo}
        />
      ) : null}
      <CowAmountText amountX={amountX} centerY={centerY} layout={layout} />
      <text x={textLeftX} y={centerY + layout.matchedY}>
        <tspan fill={CARD_TEXT_SECONDARY} fontSize="12.5">
          matched peer-to-peer
        </tspan>
      </text>
      <text x={textLeftX} y={centerY + layout.savingsY}>
        {layout.savingsLines.map((line, i) => (
          <tspan
            key={i}
            dy={i === 0 ? 0 : layout.savingsLineHeight}
            fill={Color.explorer_green1}
            fontSize="12"
            fontWeight="500"
            x={textLeftX}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
}

type CowMatchedTokenBadgeProps = {
  centerX: number
  centerY: number
  iconClipId: string
  logo: string
}

function CowMatchedTokenBadge({ centerX, centerY, iconClipId, logo }: CowMatchedTokenBadgeProps): ReactNode {
  return (
    <>
      <defs>
        <clipPath id={iconClipId}>
          <circle cx={centerX + 22} cy={centerY + 52} r="8" />
        </clipPath>
      </defs>
      <image clipPath={`url(#${iconClipId})`} height="16" href={logo} width="16" x={centerX + 14} y={centerY + 44} />
    </>
  )
}

type CowAmountTextProps = {
  amountX: number
  centerY: number
  layout: ReturnType<typeof computeCowTextLayout>
}

function CowAmountText({ amountX, centerY, layout }: CowAmountTextProps): ReactNode {
  const usdOverflowY =
    centerY + 58 + (layout.amountLines.length - 1) * layout.amountLineHeight + layout.amountLineHeight

  return (
    <>
      <text x={amountX} y={centerY + 58}>
        {layout.amountLines.map((line, i) => (
          <tspan
            key={i}
            dy={i === 0 ? 0 : layout.amountLineHeight}
            fill={Color.neutral100}
            fontSize="18"
            fontWeight="700"
            x={amountX}
          >
            {line}
          </tspan>
        ))}
        {layout.usdLabel && layout.usdFitsInline ? (
          <tspan dx="2" fill="rgba(229, 235, 255, 0.62)" fontSize="11" fontWeight="500">
            ({layout.usdLabel})
          </tspan>
        ) : null}
      </text>
      {layout.usdLabel && !layout.usdFitsInline ? (
        <text fill="rgba(229, 235, 255, 0.62)" fontSize="11" fontWeight="500" x={amountX} y={usdOverflowY}>
          ({layout.usdLabel})
        </text>
      ) : null}
    </>
  )
}

function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type RouteHeaderLogoBadgeProps = {
  centerX: number
  centerY: number
  logo: string
}

function RouteHeaderLogoBadge({ centerX, centerY, logo }: RouteHeaderLogoBadgeProps): ReactNode {
  return <image height="14" href={logo} width="14" x={centerX + 14} y={centerY + 9} />
}

type DetailsHintBadgeProps = {
  x: number
  y: number
  onClick?: () => void
}

function DetailsHintBadge({ x, y, onClick }: DetailsHintBadgeProps): ReactNode {
  return (
    <g
      onClick={(event): void => {
        event.stopPropagation()
        onClick?.()
      }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <title>Click for execution breakdown</title>
      <circle cx={x} cy={y} fill={DETAILS_BADGE_FILL} r="7.2" stroke={DETAILS_BADGE_STROKE} strokeWidth="1" />
      <text
        fill={DETAILS_BADGE_TEXT}
        fontSize="9"
        fontWeight="700"
        style={{ letterSpacing: '0.01em' }}
        textAnchor="middle"
        x={x}
        y={y + 3.1}
      >
        i
      </text>
    </g>
  )
}

type RouteAddressLabelProps = {
  x: number
  y: number
  lines: string[]
  href?: string
  fontSize?: number
}

function RouteAddressLabel({ x, y, lines, href, fontSize = 12.5 }: RouteAddressLabelProps): ReactNode {
  const [isHovered, setIsHovered] = useState(false)
  const showExternalIcon = Boolean(href)
  const safeLines = lines.length ? lines : ['']
  const lastLineIndex = safeLines.length - 1

  const text = (
    <text
      fill={ROUTE_ADDRESS_TEXT}
      fontSize={fontSize}
      style={{
        cursor: href ? 'pointer' : 'default',
        textDecoration: href && isHovered ? 'underline' : 'none',
        textDecorationThickness: '1px',
      }}
      x={x}
      y={y}
    >
      {safeLines.map((line, index) => (
        <tspan key={`${line}-${index}`} dy={index === 0 ? 0 : 13} x={x}>
          {line}
          {showExternalIcon && index === lastLineIndex ? (
            <tspan dx="4" fill={ROUTE_ADDRESS_TEXT} opacity={isHovered ? '0.92' : '0.55'}>
              ↗
            </tspan>
          ) : null}
        </tspan>
      ))}
    </text>
  )

  if (!href) {
    return text
  }

  return (
    <g onMouseEnter={(): void => setIsHovered(true)} onMouseLeave={(): void => setIsHovered(false)}>
      <a href={href} rel="noopener noreferrer" target="_blank">
        {text}
      </a>
    </g>
  )
}

function splitRouteSourceLines(label: string): string[] {
  const SOURCE_LINE_CHAR_LIMIT = 37
  const [sourcePrefix, sourceSuffix] = label.split(' · ')

  if (!sourceSuffix) {
    return limitRouteLineCount(wrapRouteLine(label, SOURCE_LINE_CHAR_LIMIT))
  }

  return limitRouteLineCount([
    trimLine(sourcePrefix, SOURCE_LINE_CHAR_LIMIT),
    trimLine(`· ${sourceSuffix}`, SOURCE_LINE_CHAR_LIMIT),
  ])
}

function getExecutionMixTreeLines(executionBreakdown: ExecutionBreakdown): string[] {
  const counts = executionBreakdown.hops.reduce(
    (totals, hop) => {
      totals[hop.fromKind] += 1
      totals[hop.toKind] += 1
      return totals
    },
    { settlement: 0, venue: 0, 'special-flow': 0, unknown: 0 } as Record<ExecutionHopEndpointKind, number>,
  )

  const mixLines: string[] = []
  if (counts.venue) {
    mixLines.push(`External endpoint touches: ${counts.venue}`)
  }
  if (counts['special-flow']) {
    const specialFlowLabel = getSingleSpecialFlowLabel(executionBreakdown) || 'Special Flow'
    mixLines.push(`${specialFlowLabel}: ${counts['special-flow']}`)
  }
  if (counts.unknown) {
    mixLines.push(`Unknown: ${counts.unknown}`)
  }

  if (!mixLines.length && executionBreakdown.venues.length) {
    mixLines.push(`External endpoint touches: ${executionBreakdown.venues.length}`)
  }

  const formattedMix = (mixLines.length ? mixLines : ['Settlement-only flow']).slice(0, 2)
  return formattedMix.map((line, index) => `${index === formattedMix.length - 1 ? '└' : '├'}─ ${line}`)
}

function wrapRouteLine(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const candidateLine = currentLine ? `${currentLine} ${word}` : word

    if (candidateLine.length > maxChars && currentLine) {
      lines.push(currentLine)
      currentLine = word
      return
    }

    currentLine = candidateLine
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function limitRouteLineCount(lines: string[]): string[] {
  const maxLines = 2
  if (lines.length <= maxLines) {
    return lines
  }

  const trimmedLines = lines.slice(0, maxLines)
  const lastLine = trimmedLines[maxLines - 1]

  trimmedLines[maxLines - 1] = `${lastLine.slice(0, Math.max(lastLine.length - 1, 1))}…`
  return trimmedLines
}

function trimLine(line: string, maxChars: number): string {
  if (line.length <= maxChars) {
    return line
  }

  return `${line.slice(0, Math.max(maxChars - 1, 1))}…`
}
