import { type ReactNode, useEffect, useState } from 'react'

import { Color } from '@cowprotocol/ui'

import {
  ActiveFlowFocus,
  getItemOpacity,
  getPathWidth,
  isRouteActive,
  RouteHoverHandlers,
} from './CompactLayout.interactions'
import { LinkShape } from './CompactLayout.model'
import { splitAmountUsdLabel } from './CompactLayout.visuals'

type FlowLinksProps = {
  activeFlowFocus?: ActiveFlowFocus
  flowKind: 'cow' | 'amm'
  hideLabels: boolean
  links: LinkShape[]
  strokeColor: string
} & RouteHoverHandlers

export function FlowLinks({
  activeFlowFocus,
  flowKind,
  hideLabels,
  links,
  strokeColor,
  activeRouteIds,
  onRouteEnter,
  onRouteLeave,
}: FlowLinksProps): ReactNode {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <>
      {links.map((link) => (
        <FlowLinkItem
          activeFlowFocus={activeFlowFocus}
          key={link.id}
          activeRouteIds={activeRouteIds}
          flowKind={flowKind}
          hideLabels={hideLabels}
          link={link}
          onRouteEnter={onRouteEnter}
          onRouteLeave={onRouteLeave}
          prefersReducedMotion={prefersReducedMotion}
          strokeColor={strokeColor}
        />
      ))}
    </>
  )
}

type FlowLinkItemProps = {
  activeFlowFocus?: ActiveFlowFocus
  flowKind: 'cow' | 'amm'
  hideLabels: boolean
  link: LinkShape
  prefersReducedMotion: boolean
  strokeColor: string
} & RouteHoverHandlers

function FlowLinkItem({
  activeFlowFocus,
  flowKind,
  hideLabels,
  link,
  prefersReducedMotion,
  strokeColor,
  activeRouteIds,
  onRouteEnter,
  onRouteLeave,
}: FlowLinkItemProps): ReactNode {
  const [isHovered, setIsHovered] = useState(false)
  const style = getFlowLinkVisualStyle(link.id, strokeColor)
  const isActive = isRouteActive(activeRouteIds, link.routeId)
  const linkOpacity = getItemOpacity(activeRouteIds, link.routeId) * getFlowFocusOpacity(activeFlowFocus, flowKind)
  const basePathWidth = getPathWidth(activeRouteIds, link.routeId, link.width)
  const pathWidth = getRenderedPathWidth(style.isCowLink, basePathWidth, isActive)
  const labelWidth = getLabelWidth(link.label)
  const cowPathId = style.isCowLink ? getCowMotionPathId(link.id) : undefined
  const cowPatternId = style.isCowLink ? getCowPatternId(link.id, link.routeId) : undefined
  const cowPatternSeed = style.isCowLink ? hashString(`${link.id}-${link.routeId}`) : undefined
  const shouldShowLabel = !hideLabels || isActive

  const onMouseEnter = (): void => {
    setIsHovered(true)
    onRouteEnter(link.routeId)
  }

  const onMouseLeave = (): void => {
    setIsHovered(false)
    onRouteLeave()
  }

  return (
    <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{ cursor: 'pointer' }}>
      <title>{link.tooltipLabel}</title>
      {style.isCowLink && cowPatternId && cowPatternSeed !== undefined ? (
        <CowHidePatternDefs
          patternId={cowPatternId}
          prefersReducedMotion={prefersReducedMotion}
          seed={cowPatternSeed}
        />
      ) : null}
      <FlowLinkPaths
        gradientId={style.gradientId}
        isActive={isActive}
        link={link}
        linkOpacity={linkOpacity}
        pathWidth={pathWidth}
        style={style}
      />
      {style.isCowLink ? (
        <CowFlowDecorations
          cowPatternId={cowPatternId}
          cowPathId={cowPathId}
          hideLabels={hideLabels}
          isActive={isActive}
          linkOpacity={linkOpacity}
          path={link.path}
          pathWidth={pathWidth}
          prefersReducedMotion={prefersReducedMotion}
          showParticles={style.isCowOutLink}
        />
      ) : null}
      <FlowEdgeLabel
        isActive={isActive}
        isVisible={shouldShowLabel}
        label={link.label}
        labelBorderColor={style.labelBorderColor}
        labelWidth={labelWidth}
        x={link.labelX}
        y={link.labelY}
      />
      {isHovered ? <FlowTooltip text={link.tooltipLabel} x={link.labelX} y={link.labelY - 22} /> : null}
    </g>
  )
}

type FlowLinkVisualStyle = {
  baseOpacity: number
  edgeOutlineColor: string
  gradientId: string
  gradientStops: GradientStopSet
  isCowLink: boolean
  isCowOutLink: boolean
  labelBorderColor: string
}

function getFlowLinkVisualStyle(linkId: string, strokeColor: string): FlowLinkVisualStyle {
  const isCowLink = strokeColor === Color.explorer_yellow4
  const isCowOutLink = isCowLink && linkId.startsWith('cow-out-')
  const isBuyLink = linkId.startsWith('buy-link-')
  const flowStrokeColor = isCowLink ? Color.explorer_yellow4 : strokeColor

  return {
    baseOpacity: isCowLink ? 0.92 : 0.72,
    edgeOutlineColor: darkenHexColor(flowStrokeColor, isCowLink ? 0.52 : 0.34),
    gradientId: getLinkGradientId(linkId, strokeColor),
    gradientStops: getGradientStops({
      isBuyLink,
      isCowLink,
      strokeColor: flowStrokeColor,
    }),
    isCowLink,
    isCowOutLink,
    labelBorderColor: hexToRgba(flowStrokeColor, 0.42),
  }
}

function getFlowFocusOpacity(activeFlowFocus: ActiveFlowFocus | undefined, flowKind: 'cow' | 'amm'): number {
  if (!activeFlowFocus || activeFlowFocus === 'route') {
    return 1
  }

  return activeFlowFocus === flowKind ? 1 : 0.13
}

function getRenderedPathWidth(isCowLink: boolean, basePathWidth: number, isActive: boolean): number {
  if (!isCowLink) {
    return basePathWidth
  }

  const minCowWidth = 5.8
  const activeBoost = isActive ? 2.4 : 0.8

  return Math.max(basePathWidth + activeBoost, minCowWidth)
}

type FlowLinkPathsProps = {
  gradientId: string
  isActive: boolean
  link: LinkShape
  linkOpacity: number
  pathWidth: number
  style: FlowLinkVisualStyle
}

function FlowLinkPaths({ gradientId, isActive, link, linkOpacity, pathWidth, style }: FlowLinkPathsProps): ReactNode {
  return (
    <>
      <EdgeGradientDefs gradientId={gradientId} link={link} stops={style.gradientStops} />
      {style.isCowLink ? (
        <path d={link.path} fill="none" id={getCowMotionPathId(link.id)} stroke="transparent" strokeWidth="0" />
      ) : null}
      <path
        d={link.path}
        fill="none"
        opacity={linkOpacity * Math.min(style.baseOpacity + 0.1, 1)}
        stroke={style.edgeOutlineColor}
        strokeWidth={pathWidth + 1}
        style={{
          filter: isActive ? 'drop-shadow(0 0 8px rgba(255,255,255,0.22))' : undefined,
          transition: 'opacity 160ms ease, stroke-width 160ms ease, filter 160ms ease',
        }}
      />
      <path
        d={link.path}
        fill="none"
        opacity={linkOpacity * style.baseOpacity}
        stroke={`url(#${gradientId})`}
        strokeWidth={pathWidth}
        style={{ transition: 'opacity 160ms ease, stroke-width 160ms ease' }}
      />
    </>
  )
}

type CowFlowDecorationsProps = {
  cowPatternId?: string
  cowPathId?: string
  hideLabels: boolean
  isActive: boolean
  linkOpacity: number
  path: string
  pathWidth: number
  prefersReducedMotion: boolean
  showParticles: boolean
}

type GradientStopSet = {
  start: string
  mid: string
  end: string
}

type EdgeGradientDefsProps = {
  gradientId: string
  link: LinkShape
  stops: GradientStopSet
}

function EdgeGradientDefs({ gradientId, link, stops }: EdgeGradientDefsProps): ReactNode {
  return (
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id={gradientId}
        x1={link.sourceX}
        x2={link.targetX}
        y1={link.sourceY}
        y2={link.targetY}
      >
        <stop offset="0%" stopColor={stops.start} />
        <stop offset="50%" stopColor={stops.mid} />
        <stop offset="100%" stopColor={stops.end} />
      </linearGradient>
    </defs>
  )
}

type GetGradientStopsParams = {
  isBuyLink: boolean
  isCowLink: boolean
  strokeColor: string
}

function getGradientStops({ isBuyLink, isCowLink, strokeColor }: GetGradientStopsParams): GradientStopSet {
  if (isCowLink) {
    return {
      start: lightenHexColor(strokeColor, 0.1),
      mid: strokeColor,
      end: darkenHexColor(strokeColor, 0.14),
    }
  }

  if (isBuyLink) {
    return {
      start: darkenHexColor(strokeColor, 0.18),
      mid: strokeColor,
      end: lightenHexColor(strokeColor, 0.14),
    }
  }

  return {
    start: darkenHexColor(strokeColor, 0.14),
    mid: lightenHexColor(strokeColor, 0.16),
    end: strokeColor,
  }
}

function CowFlowDecorations({
  cowPatternId,
  cowPathId,
  hideLabels,
  isActive,
  linkOpacity,
  path,
  pathWidth,
  prefersReducedMotion,
  showParticles,
}: CowFlowDecorationsProps): ReactNode {
  return (
    <>
      {cowPatternId ? (
        <CowHideOverlay
          cowPatternId={cowPatternId}
          isActive={isActive}
          linkOpacity={linkOpacity}
          path={path}
          pathWidth={pathWidth}
        />
      ) : null}
      {cowPathId && showParticles ? (
        <CowParticleFlow
          hideLabels={hideLabels}
          isActive={isActive}
          linkOpacity={linkOpacity}
          pathId={cowPathId}
          pathWidth={pathWidth}
          prefersReducedMotion={prefersReducedMotion}
        />
      ) : null}
    </>
  )
}

type FlowEdgeLabelProps = {
  x: number
  y: number
  label: string
  labelWidth: number
  labelBorderColor: string
  isActive: boolean
  isVisible: boolean
}

function FlowEdgeLabel({
  x,
  y,
  label,
  labelWidth,
  labelBorderColor,
  isActive,
  isVisible,
}: FlowEdgeLabelProps): ReactNode {
  const { amountLabel, usdLabel } = splitAmountUsdLabel(label)

  return (
    <g opacity={isVisible ? 1 : 0}>
      <rect
        fill="rgba(15, 18, 36, 0.94)"
        height={16}
        rx="4"
        stroke={labelBorderColor}
        strokeWidth="1"
        width={labelWidth}
        x={x - labelWidth / 2}
        y={y - 8}
      />
      <text
        dominantBaseline="middle"
        fill={isActive ? Color.neutral100 : 'rgba(233, 238, 255, 0.86)'}
        fontFamily='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
        fontSize="12"
        textAnchor="middle"
        x={x}
        y={y}
        style={{ fontVariantNumeric: 'tabular-nums', transition: 'opacity 160ms ease, fill 160ms ease' }}
      >
        <tspan>{amountLabel}</tspan>
        {usdLabel ? (
          <tspan dx="2" fill="rgba(229, 235, 255, 0.62)" fontSize="11" fontWeight="500">
            ({usdLabel})
          </tspan>
        ) : null}
      </text>
    </g>
  )
}

type FlowTooltipProps = {
  x: number
  y: number
  text: string
}

function FlowTooltip({ x, y, text }: FlowTooltipProps): ReactNode {
  const textWidth = Math.max(150, text.length * 6.35 + 16)

  return (
    <g pointerEvents="none">
      <rect
        fill="rgba(24, 26, 39, 0.96)"
        height={24}
        rx="6"
        stroke="rgba(255, 255, 255, 0.24)"
        strokeWidth="1"
        width={textWidth}
        x={x - textWidth / 2}
        y={y - 12}
      />
      <text
        dominantBaseline="middle"
        fill={Color.neutral100}
        fontSize="10.5"
        fontWeight="500"
        textAnchor="middle"
        x={x}
        y={y + 0.5}
      >
        {text}
      </text>
    </g>
  )
}

type CowParticleFlowProps = {
  hideLabels: boolean
  isActive: boolean
  linkOpacity: number
  pathId: string
  pathWidth: number
  prefersReducedMotion: boolean
}

function CowParticleFlow({
  hideLabels,
  isActive,
  linkOpacity,
  pathId,
  pathWidth,
  prefersReducedMotion,
}: CowParticleFlowProps): ReactNode {
  if (prefersReducedMotion) {
    return null
  }

  const particleCount = hideLabels ? 2 : 4
  const particleFontSize = hideLabels ? Math.max(14, pathWidth * 0.92) : Math.max(16, pathWidth * 1.02)
  const particleOpacity = linkOpacity * (isActive ? 1 : 0.97)

  return (
    <>
      {Array.from({ length: particleCount }, (_, index) => {
        const duration = 3.4 + index * 0.38
        const begin = `-${index * 0.9}s`

        return (
          <text
            key={`${pathId}-cow-particle-${index}`}
            dominantBaseline="middle"
            fontSize={particleFontSize}
            opacity={particleOpacity}
            textAnchor="middle"
            style={{ filter: 'drop-shadow(0 0 2px rgba(14,14,26,0.95)) drop-shadow(0 0 4px rgba(245,245,255,0.2))' }}
          >
            {'\uD83D\uDC2E'}
            <animateMotion begin={begin} dur={`${duration}s`} repeatCount="indefinite" rotate="auto">
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </text>
        )
      })}
    </>
  )
}

type CowHideOverlayProps = {
  cowPatternId: string
  path: string
  pathWidth: number
  linkOpacity: number
  isActive: boolean
}

function CowHideOverlay({ cowPatternId, path, pathWidth, linkOpacity, isActive }: CowHideOverlayProps): ReactNode {
  const patchOpacity = linkOpacity * (isActive ? 0.9 : 0.78)
  const blobOverlayWidth = Math.max(3, pathWidth * 0.88)

  return (
    <path
      d={path}
      fill="none"
      opacity={patchOpacity}
      stroke={`url(#${cowPatternId})`}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={blobOverlayWidth}
      style={{ transition: 'opacity 160ms ease, stroke-width 160ms ease' }}
    />
  )
}

function getLabelWidth(label: string): number {
  const { amountLabel, usdLabel } = splitAmountUsdLabel(label)
  const amountWidth = amountLabel.length * 6.7
  const usdWidth = usdLabel ? usdLabel.length * 5.7 + 8 : 0

  return Math.max(56, amountWidth + usdWidth + 8)
}

function hexToRgba(color: string, opacity: number): string {
  if (!color.startsWith('#') || (color.length !== 7 && color.length !== 4)) {
    return `rgba(255, 255, 255, ${opacity})`
  }

  const normalizedHex =
    color.length === 4 ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : color
  const red = parseInt(normalizedHex.slice(1, 3), 16)
  const green = parseInt(normalizedHex.slice(3, 5), 16)
  const blue = parseInt(normalizedHex.slice(5, 7), 16)

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

function darkenHexColor(color: string, ratio = 0.25): string {
  if (!color.startsWith('#') || color.length !== 7) {
    return color
  }

  const red = Math.max(0, Math.floor(parseInt(color.slice(1, 3), 16) * (1 - ratio)))
  const green = Math.max(0, Math.floor(parseInt(color.slice(3, 5), 16) * (1 - ratio)))
  const blue = Math.max(0, Math.floor(parseInt(color.slice(5, 7), 16) * (1 - ratio)))

  return `rgb(${red}, ${green}, ${blue})`
}

function lightenHexColor(color: string, ratio = 0.2): string {
  if (!color.startsWith('#') || color.length !== 7) {
    return color
  }

  const red = Math.min(
    255,
    Math.floor(parseInt(color.slice(1, 3), 16) + (255 - parseInt(color.slice(1, 3), 16)) * ratio),
  )
  const green = Math.min(
    255,
    Math.floor(parseInt(color.slice(3, 5), 16) + (255 - parseInt(color.slice(3, 5), 16)) * ratio),
  )
  const blue = Math.min(
    255,
    Math.floor(parseInt(color.slice(5, 7), 16) + (255 - parseInt(color.slice(5, 7), 16)) * ratio),
  )

  return `rgb(${red}, ${green}, ${blue})`
}

function getLinkGradientId(linkId: string, strokeColor: string): string {
  return `edge-grad-${hashString(`${linkId}-${strokeColor}`)}`
}

function getCowMotionPathId(linkId: string): string {
  return `cow-motion-${linkId.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function getCowPatternId(linkId: string, routeId: string): string {
  return `cow-hide-${hashString(`${routeId}-${linkId}`)}`
}

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

type CowHidePatternDefsProps = {
  patternId: string
  prefersReducedMotion: boolean
  seed: number
}

function CowHidePatternDefs({ patternId, prefersReducedMotion, seed }: CowHidePatternDefsProps): ReactNode {
  const spots = createCowPatternSpots(seed)

  return (
    <defs>
      <pattern
        height="84"
        id={patternId}
        patternContentUnits="userSpaceOnUse"
        patternUnits="userSpaceOnUse"
        width="84"
        x="0"
        y="0"
      >
        {spots.map((spot) => (
          <path
            key={spot.id}
            d={BLOB_TEMPLATES[spot.templateIndex]}
            fill={spot.fill}
            transform={`translate(${spot.x} ${spot.y}) rotate(${spot.rotate}) scale(${spot.scale})`}
          />
        ))}
        {!prefersReducedMotion ? (
          <animateTransform
            attributeName="patternTransform"
            calcMode="linear"
            dur="2.2s"
            repeatCount="indefinite"
            type="translate"
            values="0 0; 84 0"
          />
        ) : null}
      </pattern>
    </defs>
  )
}

const BLOB_TEMPLATES = [
  'M-10 -6 C-7 -13 4 -13 8 -8 C12 -2 10 7 2 10 C-6 13 -13 7 -13 -1 C-13 -3 -12 -5 -10 -6 Z',
  'M-8 -10 C-3 -13 6 -12 10 -4 C13 2 10 11 2 13 C-6 15 -12 9 -12 1 C-12 -4 -11 -8 -8 -10 Z',
  'M-12 -2 C-11 -9 -2 -13 7 -11 C14 -9 16 0 12 7 C8 14 -3 15 -10 10 C-13 8 -13 3 -12 -2 Z',
  'M-6 -12 C1 -14 10 -8 12 0 C14 7 8 14 0 14 C-8 14 -14 8 -14 0 C-14 -6 -11 -10 -6 -12 Z',
  'M-13 -5 C-9 -11 0 -14 8 -10 C14 -7 15 2 10 8 C5 14 -6 15 -12 9 C-16 5 -16 -1 -13 -5 Z',
]

type CowPatternSpot = {
  id: string
  x: number
  y: number
  scale: number
  rotate: number
  fill: string
  templateIndex: number
}

function createCowPatternSpots(seed: number): CowPatternSpot[] {
  const rand = mulberry32(seed)
  const fills = ['rgba(102, 71, 0, 0.72)', 'rgba(121, 84, 0, 0.68)', 'rgba(87, 59, 0, 0.74)', 'rgba(136, 95, 0, 0.62)']
  const count = 12
  const spots: CowPatternSpot[] = []

  for (let index = 0; index < count; index++) {
    const largeBlobBias = rand() > 0.72
    const scale = largeBlobBias ? 1.25 + rand() * 0.55 : 0.55 + rand() * 0.75

    spots.push({
      id: `spot-${index}`,
      x: Math.round(rand() * 84),
      y: Math.round(rand() * 84),
      scale: roundToThree(scale),
      rotate: Math.round(rand() * 360),
      fill: fills[Math.floor(rand() * fills.length)],
      templateIndex: Math.floor(rand() * BLOB_TEMPLATES.length),
    })
  }

  return spots
}

function mulberry32(seed: number): () => number {
  return (): number => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function roundToThree(value: number): number {
  return Math.round(value * 1000) / 1000
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent): void => {
      setPrefersReducedMotion(event.matches)
    }

    setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', onChange)

    return (): void => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [])

  return prefersReducedMotion
}
