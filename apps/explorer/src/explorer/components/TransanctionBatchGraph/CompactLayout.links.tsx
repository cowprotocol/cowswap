import { Color } from '@cowprotocol/ui'

import { getItemOpacity, getPathWidth, isRouteActive, RouteHoverHandlers } from './CompactLayout.interactions'
import { LinkShape } from './CompactLayout.model'

type FlowLinksProps = {
  hideLabels: boolean
  links: LinkShape[]
  strokeColor: string
} & RouteHoverHandlers

export function FlowLinks({
  hideLabels,
  links,
  strokeColor,
  activeRouteIds,
  onRouteEnter,
  onRouteLeave,
}: FlowLinksProps): JSX.Element {
  return (
    <>
      {links.map((link) => (
        <FlowLinkItem
          key={link.id}
          activeRouteIds={activeRouteIds}
          hideLabels={hideLabels}
          link={link}
          onRouteEnter={onRouteEnter}
          onRouteLeave={onRouteLeave}
          strokeColor={strokeColor}
        />
      ))}
    </>
  )
}

type FlowLinkItemProps = {
  hideLabels: boolean
  link: LinkShape
  strokeColor: string
} & RouteHoverHandlers

function FlowLinkItem({
  hideLabels,
  link,
  strokeColor,
  activeRouteIds,
  onRouteEnter,
  onRouteLeave,
}: FlowLinkItemProps): JSX.Element {
  const isCowLink = strokeColor === Color.explorer_yellow4
  const baseOpacity = isCowLink ? 0.85 : 0.72
  const edgeOutlineColor = darkenHexColor(strokeColor, 0.34)
  const labelBorderColor = hexToRgba(strokeColor, 0.3)
  const isActive = isRouteActive(activeRouteIds, link.routeId)
  const linkOpacity = getItemOpacity(activeRouteIds, link.routeId)
  const pathWidth = getPathWidth(activeRouteIds, link.routeId, link.width)
  const labelWidth = getLabelWidth(link.label)

  return (
    <g onMouseEnter={(): void => onRouteEnter(link.routeId)} onMouseLeave={onRouteLeave} style={{ cursor: 'pointer' }}>
      <title>{link.tooltipLabel}</title>
      <path
        d={link.path}
        fill="none"
        opacity={linkOpacity * Math.min(baseOpacity + 0.1, 1)}
        stroke={edgeOutlineColor}
        strokeWidth={pathWidth + 1}
        style={{
          filter: isActive ? 'drop-shadow(0 0 8px rgba(255,255,255,0.22))' : undefined,
          transition: 'opacity 160ms ease, stroke-width 160ms ease, filter 160ms ease',
        }}
      />
      <path
        d={link.path}
        fill="none"
        opacity={linkOpacity * baseOpacity}
        stroke={strokeColor}
        strokeDasharray={isCowLink ? '8 4' : undefined}
        strokeDashoffset={isCowLink ? '0' : undefined}
        strokeWidth={pathWidth}
        style={{ transition: 'opacity 160ms ease, stroke-width 160ms ease' }}
      >
        {isCowLink ? (
          <animate attributeName="stroke-dashoffset" dur="4s" from="0" repeatCount="indefinite" to="-48" />
        ) : null}
      </path>
      {!hideLabels || isActive ? (
        <g>
          <rect
            fill="rgba(30, 30, 63, 0.9)"
            height={16}
            rx="4"
            stroke={labelBorderColor}
            strokeWidth="1"
            width={labelWidth}
            x={link.labelX - labelWidth / 2}
            y={link.labelY - 8}
          />
          <text
            dominantBaseline="middle"
            fill={isActive ? Color.neutral100 : Color.neutral70}
            fontFamily='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            fontSize="12"
            fontVariantNumeric="tabular-nums"
            textAnchor="middle"
            x={link.labelX}
            y={link.labelY}
            style={{ transition: 'opacity 160ms ease, fill 160ms ease' }}
          >
            {link.label}
          </text>
        </g>
      ) : null}
    </g>
  )
}

function getLabelWidth(label: string): number {
  return Math.max(56, label.length * 6.7 + 8)
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
