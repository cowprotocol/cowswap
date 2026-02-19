import { type ReactNode, useState } from 'react'

import { Color } from '@cowprotocol/ui'

import { ActiveFlowFocus, hasRouteOverlap, RouteSelection } from './CompactLayout.interactions'
import {
  computeCowTextLayout,
  formatAmountWithUsd,
  formatCowSavingsLabel,
  getAmmLogo,
  getTokenLogo,
} from './CompactLayout.visuals'

import CowProtocolIcon from '../../../assets/img/CoW-protocol.svg'
import { Network } from '../../../types'
import { abbreviateString } from '../../../utils'

const GLASS_CARD_FILL = 'rgba(13, 16, 34, 0.9)'
const CARD_SHEEN_FILL = 'rgba(255, 255, 255, 0.055)'
const CARD_TEXT_SECONDARY = 'rgba(229, 235, 255, 0.68)'
const ROUTE_ADDRESS_TEXT = 'rgba(214, 223, 255, 0.62)'

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
  onRouteEnter: (selection: RouteSelection) => void
  onRouteLeave: () => void
  routeExplorerLink?: string
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
  onRouteEnter,
  onRouteLeave,
  routeExplorerLink,
}: RouteNodeProps): ReactNode {
  const opacity = getNodeOpacity(activeFlowFocus, activeRouteIds, connectedRouteIds, 'amm')
  const borderColor = routeStroke === Color.explorer_yellow4 ? Color.explorer_border : routeStroke
  const addressLabel = dexAddress ? abbreviateString(dexAddress, 8, 6) : 'No contract details'
  const ammLogo = getAmmLogo(dexLabel, dexAddress)
  const routeTitleX = ammLogo ? centerX + 36 : centerX + 14

  return (
    <g
      onMouseEnter={(): void => onRouteEnter(connectedRouteIds)}
      onMouseLeave={onRouteLeave}
      style={{ cursor: 'pointer' }}
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
      <text x={centerX + 14} y={centerY + 20}>
        <tspan fill={CARD_TEXT_SECONDARY} fontSize="11.5">
          AMM Route
        </tspan>
        <tspan dy="38" fill={Color.neutral100} fontSize="18" fontWeight="700" x={routeTitleX}>
          {dexLabel}
        </tspan>
      </text>
      {ammLogo ? <AmmLogoBadge centerX={centerX} centerY={centerY} logo={ammLogo} /> : null}
      <RouteAddressLabel
        href={routeExplorerLink}
        label={addressLabel}
        x={centerX + 14}
        y={centerY + centerHeight - 16}
      />
    </g>
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
      style={{ cursor: 'pointer' }}
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

type AmmLogoBadgeProps = {
  centerX: number
  centerY: number
  logo: string
}

function AmmLogoBadge({ centerX, centerY, logo }: AmmLogoBadgeProps): ReactNode {
  const iconCx = centerX + 22
  const iconCy = centerY + 52
  const iconClipId = `amm-logo-clip-${Math.round(centerX)}-${Math.round(centerY)}`

  return (
    <>
      <defs>
        <clipPath id={iconClipId}>
          <circle cx={iconCx} cy={iconCy} r="8" />
        </clipPath>
      </defs>
      <image clipPath={`url(#${iconClipId})`} height="16" href={logo} width="16" x={centerX + 14} y={centerY + 44} />
    </>
  )
}

type RouteAddressLabelProps = {
  x: number
  y: number
  label: string
  href?: string
}

function RouteAddressLabel({ x, y, label, href }: RouteAddressLabelProps): ReactNode {
  const [isHovered, setIsHovered] = useState(false)
  const showExternalIcon = Boolean(href)

  const text = (
    <text
      fill={ROUTE_ADDRESS_TEXT}
      fontSize="12.5"
      style={{
        cursor: href ? 'pointer' : 'default',
        textDecoration: href && isHovered ? 'underline' : 'none',
        textDecorationThickness: '1px',
      }}
      x={x}
      y={y}
    >
      <tspan>{label}</tspan>
      {showExternalIcon ? (
        <tspan dx="4" fill={ROUTE_ADDRESS_TEXT} opacity={isHovered ? '0.92' : '0.55'}>
          ↗
        </tspan>
      ) : null}
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
