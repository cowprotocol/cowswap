import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

/**
 * Inner (liquid) area of the glass, sitting 3px inside the outline stroke so the milk
 * never bleeds over it. The walls taper linearly from HALF_WIDTH_TOP to HALF_WIDTH_BOTTOM.
 */
const INNER_TOP = 12
const INNER_BOTTOM = 144
const CENTER_X = 60
const HALF_WIDTH_TOP = 34
const HALF_WIDTH_BOTTOM = 25

/** The CoW head from `@cowprotocol/assets/images/logo-icon-cow.svg` (36x24), inlined because the
 * milk level has to render behind it inside the same clip. Eyes are even-odd holes, so whatever is
 * behind the head — milk or panel — shows through them, like in the mockups. */
const COW_HEAD_PATH =
  'M13.653 24a4.011 4.011 0 0 1-3.824-2.79L7.11 12.666H5.44a4.01 4.01 0 0 1-3.825-2.791L0 4.8h6.058L2.863 0h30.274l-3.195 4.8H36l-1.615 5.076a4.01 4.01 0 0 1-3.825 2.79h-1.67l-2.72 8.544A4.01 4.01 0 0 1 22.346 24h-8.693ZM11.6 10.333c0 1.289.965 2.334 2.156 2.334 1.19 0 2.155-1.045 2.155-2.334 0-1.288-.965-2.333-2.155-2.333S11.6 9.045 11.6 10.333Zm12.8 0c0 1.289-.965 2.334-2.156 2.334-1.19 0-2.155-1.045-2.155-2.334 0-1.288.965-2.333 2.155-2.333S24.4 9.045 24.4 10.333Z'

const COW_HEAD_SCALE = 1.3
const COW_HEAD_CENTER_Y = 80

export interface MilkGlassProps {
  /** Remaining share of the signing window, 0..1: 1 renders a full glass, 0 an empty one. */
  fraction: number
}

export function MilkGlass({ fraction }: MilkGlassProps): ReactNode {
  const level = Math.min(1, Math.max(0, fraction))
  const milkTop = INNER_BOTTOM - (INNER_BOTTOM - INNER_TOP) * level
  const headOffsetX = CENTER_X - 18 * COW_HEAD_SCALE
  const headOffsetY = COW_HEAD_CENTER_Y - 12 * COW_HEAD_SCALE

  return (
    <svg viewBox="0 0 120 156" width="120" height="156" role="img" aria-hidden="true">
      <defs>
        <clipPath id="solana-signing-milk-glass-clip">
          <path d={innerGlassPath()} />
        </clipPath>
      </defs>

      <g clipPath="url(#solana-signing-milk-glass-clip)">
        <path d={innerGlassPath()} fill={`var(${UI.COLOR_NEUTRAL_100})`} fillOpacity="0.18" />
        <rect
          x={CENTER_X - HALF_WIDTH_TOP}
          y={milkTop}
          width={HALF_WIDTH_TOP * 2}
          height={INNER_BOTTOM - milkTop + 2}
          fill={`var(${UI.COLOR_NEUTRAL_100})`}
          style={{ transition: 'y 0.5s linear, height 0.5s linear' }}
        />
        {level > 0 && level < 1 && (
          <ellipse
            cx={CENTER_X}
            cy={milkTop}
            rx={halfWidthAt(milkTop)}
            ry="3"
            fill={`var(${UI.COLOR_NEUTRAL_100})`}
            style={{ transition: 'cy 0.5s linear, rx 0.5s linear' }}
          />
        )}
        <path
          d={COW_HEAD_PATH}
          fill={`var(${UI.COLOR_BLUE_900_PRIMARY})`}
          fillRule="evenodd"
          clipRule="evenodd"
          transform={`translate(${headOffsetX} ${headOffsetY}) scale(${COW_HEAD_SCALE})`}
        />
      </g>

      <path
        d={outlinePath()}
        fill="none"
        stroke={`var(${UI.COLOR_NEUTRAL_100})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function halfWidthAt(y: number): number {
  const progress = (y - INNER_TOP) / (INNER_BOTTOM - INNER_TOP)

  return HALF_WIDTH_TOP - (HALF_WIDTH_TOP - HALF_WIDTH_BOTTOM) * progress
}

function innerGlassPath(): string {
  const topLeft = CENTER_X - HALF_WIDTH_TOP
  const topRight = CENTER_X + HALF_WIDTH_TOP
  const bottomLeft = CENTER_X - HALF_WIDTH_BOTTOM
  const bottomRight = CENTER_X + HALF_WIDTH_BOTTOM

  return [
    `M${topLeft} ${INNER_TOP}`,
    `L${bottomLeft} ${INNER_BOTTOM - 6}`,
    `Q${bottomLeft + 0.5} ${INNER_BOTTOM} ${bottomLeft + 7} ${INNER_BOTTOM}`,
    `L${bottomRight - 7} ${INNER_BOTTOM}`,
    `Q${bottomRight - 0.5} ${INNER_BOTTOM} ${bottomRight} ${INNER_BOTTOM - 6}`,
    `L${topRight} ${INNER_TOP}`,
    'Z',
  ].join(' ')
}

function outlinePath(): string {
  const topLeft = CENTER_X - HALF_WIDTH_TOP - 3
  const topRight = CENTER_X + HALF_WIDTH_TOP + 3
  const bottomLeft = CENTER_X - HALF_WIDTH_BOTTOM - 3
  const bottomRight = CENTER_X + HALF_WIDTH_BOTTOM + 3
  const bottom = INNER_BOTTOM + 3

  return [
    `M${topLeft} 8`,
    `L${bottomLeft} ${bottom - 8}`,
    `Q${bottomLeft + 0.5} ${bottom} ${bottomLeft + 8} ${bottom}`,
    `L${bottomRight - 8} ${bottom}`,
    `Q${bottomRight - 0.5} ${bottom} ${bottomRight} ${bottom - 8}`,
    `L${topRight} 8`,
  ].join(' ')
}
