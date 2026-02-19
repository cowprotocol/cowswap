import { type ReactNode, useState } from 'react'

import { getBlockExplorerUrl } from '@cowprotocol/common-utils'
import { Color } from '@cowprotocol/ui'

import { getItemOpacity, isRouteActive, RouteHoverHandlers } from './CompactLayout.interactions'
import { SankeyModel } from './CompactLayout.model'
import {
  formatAmountWithUsd,
  formatTokenAmount,
  getAddressAccentColor,
  getTokenLogo,
  splitAmountUsdLabel,
} from './CompactLayout.visuals'
import { CompactRoute } from './types'

import { Network } from '../../../types'

const GLASS_CARD_FILL = 'rgba(13, 16, 34, 0.9)'
const CARD_SHEEN_FILL = 'rgba(255, 255, 255, 0.055)'
const CARD_TEXT_SECONDARY = 'rgba(229, 235, 255, 0.68)'
const CARD_ADDRESS_Y_OFFSET = 46
const CARD_AMOUNT_Y_OFFSET_DESKTOP = 66
const CARD_AMOUNT_Y_OFFSET_MOBILE = 62
const FLOW_TOOLTIP_PADDING_X = 10
const FLOW_TOOLTIP_PADDING_Y = 8
const FLOW_TOOLTIP_LINE_HEIGHT = 14

type SideNodesProps = {
  routes: CompactRoute[]
  model: SankeyModel
  networkId: Network | undefined
  showUsdValues: boolean
} & RouteHoverHandlers

export function LeftNodes({
  routes,
  model,
  networkId,
  showUsdValues,
  activeRouteIds,
  onRouteEnter,
  onRouteLeave,
}: SideNodesProps): ReactNode {
  return (
    <>
      {routes.map((route, index) => {
        const y = model.getRowY(index)
        const traderLink = networkId ? getBlockExplorerUrl(networkId, 'address', route.traderAddress) : undefined
        const accentColor = getAddressAccentColor(route.traderAddress)
        const isActive = isRouteActive(activeRouteIds, route.id)
        const opacity = getItemOpacity(activeRouteIds, route.id)
        const surplusSide = route.surplusSide || 'receive'

        return (
          <g
            key={`left-node-${route.id}`}
            onMouseEnter={(): void => onRouteEnter(route.id)}
            onMouseLeave={onRouteLeave}
            style={{ cursor: 'pointer' }}
          >
            <SideCardBackground
              accentColor={accentColor}
              clipId={`left-card-clip-${route.id}`}
              isActive={isActive}
              model={model}
              opacity={opacity}
              x={model.leftX}
              y={y}
            />
            <CardTag align="left" model={model} text="SELL" x={model.leftX} y={y} />
            <CardAddress href={traderLink} label={route.traderLabel} model={model} x={model.leftX} y={y} />
            <CardAmount
              iconHref={getTokenLogo(route.sellToken?.address, networkId)}
              label={formatAmountWithUsd(
                formatTokenAmount(route.sellAmountValue, route.sellToken?.symbol),
                route.sellAmountUsdValue,
                showUsdValues,
              )}
              model={model}
              x={model.leftX}
              y={y}
            />
            {route.surplusLabel && surplusSide === 'sell' ? (
              <SurplusText label={route.surplusLabel} model={model} side={surplusSide} x={model.leftX} y={y} />
            ) : null}
            {route.surplusLabel && surplusSide === 'receive' ? (
              <SurplusIndicator label={route.surplusLabel} model={model} side={surplusSide} x={model.leftX} y={y} />
            ) : null}
          </g>
        )
      })}
    </>
  )
}

export function RightNodes({
  routes,
  model,
  networkId,
  showUsdValues,
  activeRouteIds,
  onRouteEnter,
  onRouteLeave,
}: SideNodesProps): ReactNode {
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null)
  const flowHintByRouteId = buildFlowHintByRouteId(model)

  return (
    <>
      {routes.map((route, index) => {
        const y = model.getRowY(index)
        const receiverLink = networkId ? getBlockExplorerUrl(networkId, 'address', route.receiverAddress) : undefined
        const accentColor = getAddressAccentColor(route.receiverAddress)
        const isActive = isRouteActive(activeRouteIds, route.id)
        const opacity = getItemOpacity(activeRouteIds, route.id)
        const surplusSide = route.surplusSide || 'receive'
        const flowHint = flowHintByRouteId.get(route.id)

        return (
          <g
            key={`right-node-${route.id}`}
            onMouseEnter={(): void => {
              setHoveredRouteId(route.id)
              onRouteEnter(route.id)
            }}
            onMouseLeave={(): void => {
              setHoveredRouteId(null)
              onRouteLeave()
            }}
            style={{ cursor: 'pointer' }}
          >
            <SideCardBackground
              accentColor={accentColor}
              clipId={`right-card-clip-${route.id}`}
              isActive={isActive}
              model={model}
              opacity={opacity}
              x={model.rightX}
              y={y}
            />
            <CardTag align="right" model={model} text="RECEIVED" x={model.rightX} y={y} />
            <CardAddress href={receiverLink} label={route.receiverLabel} model={model} x={model.rightX} y={y} />
            <CardAmount
              iconHref={getTokenLogo(route.buyToken?.address, networkId)}
              label={formatAmountWithUsd(
                formatTokenAmount(route.buyAmountValue, route.buyToken?.symbol),
                route.buyAmountUsdValue,
                showUsdValues,
              )}
              model={model}
              x={model.rightX}
              y={y}
            />
            {flowHint ? (
              <RouteHintPill
                hint={flowHint}
                model={model}
                showTooltip={hoveredRouteId === route.id}
                x={model.rightX}
                y={y}
              />
            ) : null}
            {route.surplusLabel && surplusSide === 'receive' ? (
              <SurplusText label={route.surplusLabel} model={model} side={surplusSide} x={model.rightX} y={y} />
            ) : null}
            {route.surplusLabel && surplusSide === 'sell' ? (
              <SurplusIndicator label={route.surplusLabel} model={model} side={surplusSide} x={model.rightX} y={y} />
            ) : null}
          </g>
        )
      })}
    </>
  )
}

type SideCardBackgroundProps = {
  x: number
  y: number
  clipId: string
  model: SankeyModel
  opacity: number
  isActive: boolean
  accentColor: string
}

function SideCardBackground({
  x,
  y,
  clipId,
  model,
  opacity,
  isActive,
  accentColor,
}: SideCardBackgroundProps): ReactNode {
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect height={model.nodeHeight} rx="10" width={model.nodeWidth} x={x} y={y} />
        </clipPath>
      </defs>
      <rect
        fill={GLASS_CARD_FILL}
        height={model.nodeHeight}
        opacity={opacity}
        rx="10"
        stroke={accentColor}
        strokeOpacity={isActive ? 0.9 : 0.58}
        strokeWidth={isActive ? '1.8' : '1.1'}
        style={{
          backdropFilter: 'blur(8px)',
          transition: 'opacity 160ms ease, stroke-width 160ms ease, stroke-opacity 160ms ease, stroke 160ms ease',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        width={model.nodeWidth}
        x={x}
        y={y}
      />
      <rect
        fill={CARD_SHEEN_FILL}
        height={Math.max(18, model.nodeHeight * 0.26)}
        opacity={opacity}
        rx="10"
        width={model.nodeWidth}
        x={x}
        y={y}
      />
      <rect
        fill={accentColor}
        clipPath={`url(#${clipId})`}
        height={model.nodeHeight}
        opacity={isActive ? '0.95' : '0.72'}
        width="3"
        x={x}
        y={y}
      />
      {isActive ? (
        <rect
          fill="none"
          height={model.nodeHeight}
          opacity="0.42"
          rx="10"
          stroke={accentColor}
          strokeWidth="2.2"
          width={model.nodeWidth}
          x={x}
          y={y}
        >
          <animate attributeName="opacity" dur="1.3s" repeatCount="indefinite" values="0.16;0.62;0.16" />
        </rect>
      ) : null}
    </>
  )
}

type CardTagProps = {
  x: number
  y: number
  text: string
  align: 'left' | 'right'
  model: SankeyModel
}

function CardTag({ x, y, text, align, model }: CardTagProps): ReactNode {
  const textX = align === 'left' ? x + 12 : x + model.nodeWidth - 12

  return (
    <text
      fill={CARD_TEXT_SECONDARY}
      fontSize="10"
      fontWeight="700"
      letterSpacing="0.08em"
      opacity="0.9"
      textAnchor={align === 'left' ? 'start' : 'end'}
      x={textX}
      y={y + 18}
    >
      {text}
    </text>
  )
}

type CardAddressProps = {
  x: number
  y: number
  label: string
  href?: string
  model: SankeyModel
}

function CardAddress({ x, y, label, href, model }: CardAddressProps): ReactNode {
  const [isHovered, setIsHovered] = useState(false)
  const fontSize = model.nodeWidth < 220 ? '12' : '13'
  const showExternalIcon = Boolean(href)

  const addressText = (
    <text
      fill={CARD_TEXT_SECONDARY}
      fontSize={fontSize}
      opacity="1"
      style={{
        cursor: href ? 'pointer' : 'default',
        textDecoration: href && isHovered ? 'underline' : 'none',
        textDecorationThickness: '1px',
      }}
      x={x + 14}
      y={y + CARD_ADDRESS_Y_OFFSET}
    >
      <tspan>{label}</tspan>
      {showExternalIcon ? (
        <tspan dx="4" fill={CARD_TEXT_SECONDARY} fontSize={fontSize} opacity={isHovered ? '0.92' : '0.52'}>
          ↗
        </tspan>
      ) : null}
    </text>
  )

  if (!href) {
    return addressText
  }

  return (
    <g onMouseEnter={(): void => setIsHovered(true)} onMouseLeave={(): void => setIsHovered(false)}>
      <a href={href} rel="noopener noreferrer" target="_blank">
        {addressText}
      </a>
    </g>
  )
}

type CardAmountProps = {
  x: number
  y: number
  label: string
  iconHref: string
  model: SankeyModel
}

function CardAmount({ x, y, label, iconHref, model }: CardAmountProps): ReactNode {
  const amountY = y + (model.nodeWidth < 220 ? CARD_AMOUNT_Y_OFFSET_MOBILE : CARD_AMOUNT_Y_OFFSET_DESKTOP)
  const { amountLabel, usdLabel } = splitAmountUsdLabel(label)
  const iconClipId = `token-icon-clip-${Math.round(x)}-${Math.round(y)}`
  const iconCx = x + 22
  const iconCy = amountY - 4

  return (
    <>
      <defs>
        <clipPath id={iconClipId}>
          <circle cx={iconCx} cy={iconCy} r="8" />
        </clipPath>
      </defs>
      <circle cx={iconCx} cy={iconCy} fill={Color.explorer_bg2} r="10" stroke={Color.explorer_border} strokeWidth="1" />
      <image clipPath={`url(#${iconClipId})`} height="16" href={iconHref} width="16" x={x + 14} y={amountY - 12} />
      <text fill={Color.neutral100} fontSize="16" fontWeight="600" x={x + 38} y={amountY + 2}>
        <tspan>{amountLabel}</tspan>
        {usdLabel ? (
          <tspan dx="2" fill="rgba(229, 235, 255, 0.62)" fontSize="11" fontWeight="500">
            ({usdLabel})
          </tspan>
        ) : null}
      </text>
    </>
  )
}

type SurplusTextProps = {
  x: number
  y: number
  label: string
  side: 'sell' | 'receive'
  model: SankeyModel
}

function SurplusText({ x, y, label, side, model }: SurplusTextProps): ReactNode {
  const surplusLabel = `${label} surplus`
  const tooltip = getSurplusTooltip(label, side)

  return (
    <g>
      <title>{tooltip}</title>
      <text
        fill={Color.explorer_green1}
        fontSize="12"
        fontWeight="500"
        textAnchor="end"
        x={x + model.nodeWidth - 12}
        y={y + model.nodeHeight - 12}
      >
        {surplusLabel}
      </text>
    </g>
  )
}

type SurplusIndicatorProps = {
  x: number
  y: number
  label: string
  side: 'sell' | 'receive'
  model: SankeyModel
}

function SurplusIndicator({ x, y, label, side, model }: SurplusIndicatorProps): ReactNode {
  const cx = x + model.nodeWidth - 14
  const cy = y + model.nodeHeight - 13
  const tooltip = getSurplusTooltip(label, side)

  return (
    <g opacity="0.72">
      <title>{tooltip}</title>
      <circle
        cx={cx}
        cy={cy}
        fill="rgba(39, 174, 96, 0.22)"
        r="6"
        stroke={Color.explorer_green1}
        strokeOpacity="0.55"
        strokeWidth="1"
      />
      <text fill={Color.explorer_green1} fontSize="8.2" fontWeight="700" textAnchor="middle" x={cx} y={cy + 2.5}>
        +
      </text>
    </g>
  )
}

type FlowHintTextProps = {
  x: number
  y: number
  hint: FlowHint
  model: SankeyModel
  showTooltip: boolean
}

function RouteHintPill({ x, y, hint, model, showTooltip }: FlowHintTextProps): ReactNode {
  const pillX = x + 14
  const pillY = y + model.nodeHeight - 24
  const pillWidth = Math.max(44, hint.pillLabel.length * 6.8 + 28 + hint.dotColors.length * 6)
  const firstDotX = pillX + 10
  const tooltipLayout = getRouteHintTooltipLayout(hint.tooltip, model, x, y)

  return (
    <g>
      <rect
        fill="rgba(15, 18, 36, 0.92)"
        height={16}
        rx="8"
        stroke="rgba(240, 185, 11, 0.38)"
        strokeWidth="1"
        width={pillWidth}
        x={pillX}
        y={pillY}
      />
      {hint.dotColors.map((dotColor, index) => (
        <circle
          key={`${hint.pillLabel}-${dotColor}-${index}`}
          cx={firstDotX + index * 6}
          cy={pillY + 8}
          fill={dotColor}
          r="2.1"
        />
      ))}
      <text
        fill={CARD_TEXT_SECONDARY}
        fontSize="9.5"
        fontWeight="600"
        letterSpacing="0.02em"
        x={firstDotX + hint.dotColors.length * 6 + 6}
        y={pillY + 11.2}
      >
        {hint.pillLabel}
      </text>
      {showTooltip ? <RouteHintTooltip hintLabel={hint.pillLabel} layout={tooltipLayout} /> : null}
    </g>
  )
}

type RouteHintTooltipLayout = {
  lines: string[]
  tooltipWidth: number
  tooltipHeight: number
  tooltipX: number
  tooltipY: number
  tooltipTop: number
  arrowBaseX: number
  arrowTipX: number
}

function getRouteHintTooltipLayout(tooltip: string, model: SankeyModel, x: number, y: number): RouteHintTooltipLayout {
  const tooltipMaxWidth = Math.max(160, Math.min(250, model.nodeWidth * 0.74))
  const tooltipMinWidth = Math.max(132, model.nodeWidth * 0.48)
  const lines = wrapFlowTooltipLines(tooltip, tooltipMaxWidth - FLOW_TOOLTIP_PADDING_X * 2)
  const tooltipTextWidth = Math.max(...lines.map(estimateTooltipTextWidth))
  const tooltipWidth = Math.min(tooltipMaxWidth, Math.max(tooltipMinWidth, tooltipTextWidth + 16))
  const tooltipHeight = Math.max(24, lines.length * FLOW_TOOLTIP_LINE_HEIGHT + FLOW_TOOLTIP_PADDING_Y * 2)
  const tooltipX = x - tooltipWidth - 16
  const tooltipY = y + model.nodeHeight * 0.33
  const tooltipTop = tooltipY - tooltipHeight / 2

  return {
    arrowBaseX: tooltipX + tooltipWidth,
    arrowTipX: x - 8,
    lines,
    tooltipHeight,
    tooltipTop,
    tooltipWidth,
    tooltipX,
    tooltipY,
  }
}

type RouteHintTooltipProps = {
  hintLabel: string
  layout: RouteHintTooltipLayout
}

function RouteHintTooltip({ hintLabel, layout }: RouteHintTooltipProps): ReactNode {
  const { arrowBaseX, arrowTipX, lines, tooltipHeight, tooltipTop, tooltipWidth, tooltipX, tooltipY } = layout

  return (
    <g pointerEvents="none">
      <polygon
        fill="rgba(20, 24, 42, 0.98)"
        points={`${arrowBaseX},${tooltipY - 4.5} ${arrowBaseX},${tooltipY + 4.5} ${arrowTipX},${tooltipY}`}
        stroke="rgba(188, 198, 232, 0.28)"
        strokeWidth="1"
      />
      <rect
        fill="rgba(20, 24, 42, 0.98)"
        height={tooltipHeight}
        rx="8"
        stroke="rgba(188, 198, 232, 0.28)"
        strokeWidth="1"
        width={tooltipWidth}
        x={tooltipX}
        y={tooltipTop}
        style={{ filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.28))' }}
      />
      {lines.map((line, index) => (
        <text
          key={`${hintLabel}-tooltip-line-${index}`}
          dominantBaseline="hanging"
          fill="rgba(244, 247, 255, 0.94)"
          fontSize="10.8"
          fontWeight="500"
          x={tooltipX + FLOW_TOOLTIP_PADDING_X}
          y={tooltipTop + FLOW_TOOLTIP_PADDING_Y + index * FLOW_TOOLTIP_LINE_HEIGHT}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

type FlowHint = {
  pillLabel: string
  tooltip: string
  dotColors: string[]
}

function buildFlowHintByRouteId(model: SankeyModel): Map<string, FlowHint> {
  const routeIds = new Set([
    ...model.sellLinks.map((link) => link.routeId),
    ...model.buyLinks.map((link) => link.routeId),
    ...model.cowInLinks.map((link) => link.routeId),
    ...model.cowOutLinks.map((link) => link.routeId),
  ])

  const sellViaAmm = new Set(model.sellLinks.map((link) => link.routeId))
  const buyViaAmm = new Set(model.buyLinks.map((link) => link.routeId))
  const sellViaCow = new Set(model.cowInLinks.map((link) => link.routeId))
  const buyViaCow = new Set(model.cowOutLinks.map((link) => link.routeId))

  const result = new Map<string, FlowHint>()

  routeIds.forEach((routeId) => {
    const hasSellViaAmm = sellViaAmm.has(routeId)
    const hasBuyViaAmm = buyViaAmm.has(routeId)
    const hasSellViaCow = sellViaCow.has(routeId)
    const hasBuyViaCow = buyViaCow.has(routeId)
    const hint = getFlowHintLabel({
      hasBuyViaAmm,
      hasBuyViaCow,
      hasSellViaAmm,
      hasSellViaCow,
    })

    if (hint) {
      result.set(routeId, hint)
    }
  })

  return result
}

type FlowHintLabelParams = {
  hasSellViaAmm: boolean
  hasSellViaCow: boolean
  hasBuyViaAmm: boolean
  hasBuyViaCow: boolean
}

function getFlowHintLabel({
  hasSellViaAmm,
  hasSellViaCow,
  hasBuyViaAmm,
  hasBuyViaCow,
}: FlowHintLabelParams): FlowHint | undefined {
  const hasAnyAmm = hasSellViaAmm || hasBuyViaAmm
  const hasAnyCow = hasSellViaCow || hasBuyViaCow
  const dotColors = getRouteHintDotColors({
    hasAnyCow,
    hasBuyViaAmm,
    hasSellViaAmm,
  })

  const pureHint = getPureFlowHint(hasAnyAmm, hasAnyCow, dotColors)
  if (pureHint) return pureHint
  if (!hasAnyCow || !hasAnyAmm) return undefined

  return {
    pillLabel: 'Mixed',
    tooltip: getMixedFlowHint({ hasSellViaAmm, hasSellViaCow, hasBuyViaAmm, hasBuyViaCow }),
    dotColors,
  }
}

function getPureFlowHint(hasAnyAmm: boolean, hasAnyCow: boolean, dotColors: string[]): FlowHint | undefined {
  if (hasAnyCow && !hasAnyAmm) {
    return {
      pillLabel: 'CoW',
      tooltip: 'Fully settled via CoW (peer-to-peer).',
      dotColors,
    }
  }

  if (hasAnyAmm && !hasAnyCow) {
    return {
      pillLabel: 'AMM',
      tooltip: 'Fully routed through AMM.',
      dotColors,
    }
  }

  return undefined
}

function getMixedFlowHint({ hasSellViaAmm, hasSellViaCow, hasBuyViaAmm, hasBuyViaCow }: FlowHintLabelParams): string {
  const sellLeg = describeLeg('Sell', hasSellViaCow, hasSellViaAmm)
  const buyLeg = describeLeg('Buy', hasBuyViaCow, hasBuyViaAmm)

  return `${sellLeg}. ${buyLeg}.`
}

function describeLeg(legLabel: 'Sell' | 'Buy', viaCow: boolean, viaAmm: boolean): string {
  if (viaCow && viaAmm) {
    return `${legLabel} leg split between CoW and AMM`
  }

  if (viaCow) {
    return `${legLabel} leg settled via CoW`
  }

  if (viaAmm) {
    return `${legLabel} leg routed through AMM`
  }

  return `${legLabel} leg not detected`
}

type RouteHintDotColorsParams = {
  hasAnyCow: boolean
  hasSellViaAmm: boolean
  hasBuyViaAmm: boolean
}

function getRouteHintDotColors({ hasAnyCow, hasSellViaAmm, hasBuyViaAmm }: RouteHintDotColorsParams): string[] {
  const dotColors: string[] = []

  if (hasAnyCow) {
    dotColors.push(Color.explorer_yellow4)
  }
  if (hasSellViaAmm) {
    dotColors.push(Color.explorer_textError)
  }
  if (hasBuyViaAmm) {
    dotColors.push(Color.explorer_green1)
  }

  return dotColors
}

function getSurplusTooltip(label: string, side: 'sell' | 'receive'): string {
  const sideLabel = side === 'sell' ? 'SELL' : 'RECEIVED'

  return `${label} surplus. Primary badge shown on ${sideLabel} side.`
}

function wrapFlowTooltipLines(text: string, maxTextWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) {
    return ['']
  }

  const lines: string[] = []
  let currentLine = words[0]

  for (let index = 1; index < words.length; index++) {
    const word = words[index]
    const candidate = `${currentLine} ${word}`

    if (estimateTooltipTextWidth(candidate) <= maxTextWidth) {
      currentLine = candidate
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }

  lines.push(currentLine)

  return lines
}

function estimateTooltipTextWidth(text: string): number {
  return text.length * 6.1
}
