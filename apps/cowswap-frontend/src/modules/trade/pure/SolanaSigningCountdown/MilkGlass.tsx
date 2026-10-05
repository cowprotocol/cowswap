import { ReactNode } from 'react'

import styled, { keyframes } from 'styled-components/macro'

/**
 * Faithful rebuild of the Figma "Milk glass / Fixed vessel" (node 3431:13117, 150x210): every path,
 * offset, opacity and stroke below is taken verbatim from the exported layers, composed into one SVG
 * so the draining milk can be clipped by the same inner-glass mask the design uses. Artwork colors
 * are intentionally literal, matching the exported assets.
 */
const VESSEL_WIDTH = 150
const VESSEL_HEIGHT = 210

/** Figma keyframes move the milk surface down by 174px from full to empty. */
const DRAIN_TRAVEL_PX = 174

const GLASS_SILHOUETTE_PATH = 'M0 0H140L126 184C125.333 193.333 120 198 110 198H30C20 198 14.6667 193.333 14 184L0 0Z'
const INNER_GLASS_MASK_PATH =
  'M0 0H128L115 178C114.333 183.333 110.667 186 104 186H24C17.3333 186 13.6667 183.333 13 178L0 0Z'
const MILK_GENTLE_SURFACE_PATH =
  'M0 1.1547C30 -2.8453 55 5.1547 85 1.1547C115 -2.8453 140 5.1547 170 1.1547C200 -2.8453 225 5.1547 255 1.1547C285 -2.8453 310 5.1547 340 1.1547V228.155H0V1.1547Z'
const GLASS_RIM_AND_EDGE_PATH =
  'M0.997118 0.0758677L14.9971 184.076C15.6638 193.409 20.9971 198.076 30.9971 198.076H110.997C120.997 198.076 126.33 193.409 126.997 184.076L140.997 0.0758677'
const GLASS_OPEN_RIM_PATH =
  'M70 1C89.3108 1 106.781 1.67124 119.412 2.75391C125.733 3.2957 130.815 3.93803 134.301 4.64453C136.052 4.99936 137.35 5.36065 138.191 5.71289C138.443 5.81819 138.632 5.91671 138.771 6C138.632 6.08329 138.443 6.18181 138.191 6.28711C137.35 6.63935 136.052 7.00064 134.301 7.35547C130.815 8.06197 125.733 8.7043 119.412 9.24609C106.781 10.3288 89.3108 11 70 11C50.6892 11 33.219 10.3288 20.5879 9.24609C14.267 8.7043 9.1855 8.06197 5.69922 7.35547C3.94837 7.00064 2.64956 6.63935 1.80859 6.28711C1.55677 6.18162 1.36731 6.08339 1.22754 6C1.36731 5.91661 1.55677 5.81838 1.80859 5.71289C2.64956 5.36065 3.94837 4.99936 5.69922 4.64453C9.1855 3.93803 14.267 3.2957 20.5879 2.75391C33.219 1.67124 50.6892 1 70 1Z'
const PRINTED_COW_MARK_PATH =
  'M19.9106 35C18.6697 35.001 17.4606 34.6074 16.4581 33.876C15.4556 33.1446 14.7117 32.1133 14.334 30.9312L10.3688 18.4713H7.93333C6.69191 18.4727 5.48222 18.0791 4.47938 17.3474C3.47654 16.6156 2.73259 15.5837 2.35521 14.401L0 7H8.83458L4.17521 0H48.3248L43.6654 7H52.5L50.1448 14.4025C49.7672 15.5849 49.0231 16.6165 48.0203 17.3479C47.0175 18.0794 45.8079 18.4728 44.5667 18.4713H42.1313L38.1646 30.9312C37.787 32.1134 37.0432 33.1448 36.0407 33.8763C35.0381 34.6077 33.8289 35.0013 32.5879 35H19.9106ZM16.9167 15.069C16.9167 16.9488 18.324 18.4727 20.0608 18.4727C21.7963 18.4727 23.2035 16.9488 23.2035 15.069C23.2035 13.1906 21.7963 11.6667 20.0608 11.6667C18.3254 11.6667 16.9167 13.1906 16.9167 15.069ZM35.5833 15.069C35.5833 16.9488 34.176 18.4727 32.4392 18.4727C30.7037 18.4727 29.2965 16.9488 29.2965 15.069C29.2965 13.1906 30.7037 11.6667 32.4392 11.6667C34.1746 11.6667 35.5833 13.1906 35.5833 15.069Z'
const GLASS_REFLECTION_PATH = 'M0 0H10L18 138H12L0 0Z'
const GLASS_FINE_EDGE_REFLECTION_PATH = 'M3 0H6L3 50H0L3 0Z'
const MILK_MOUSTACHE_PATH =
  'M0 3.13844C1 -0.861561 7 -0.861561 9 2.13844C11 -0.861561 17 -0.861561 18 3.13844C16 7.13844 11 6.13844 9 4.13844C7 6.13844 2 7.13844 0 3.13844Z'

export interface MilkGlassProps {
  /** Remaining share of the signing window, 0..1: 1 renders a full glass, 0 an empty one. */
  fraction: number
}

export function MilkGlass({ fraction }: MilkGlassProps): ReactNode {
  const level = Math.min(1, Math.max(0, fraction))
  const drainY = (1 - level) * DRAIN_TRAVEL_PX
  // The design fades the moustache in over the last fifth of the window and out again just before zero.
  const isMoustacheVisible = level > 0.03 && level <= 0.2

  return (
    <Vessel viewBox={`0 0 ${VESSEL_WIDTH} ${VESSEL_HEIGHT}`} role="img" aria-hidden="true" overflow="visible">
      <defs>
        <clipPath id="solana-signing-milk-glass-clip">
          <path d={INNER_GLASS_MASK_PATH} transform="translate(11 8)" />
        </clipPath>
      </defs>

      <ellipse cx="75" cy="205.5" rx="58" ry="4.5" opacity="0.1" fill="#00234E" />
      <path d={GLASS_SILHOUETTE_PATH} transform="translate(5 4)" opacity="0.12" fill="white" />

      <g clipPath="url(#solana-signing-milk-glass-clip)">
        <g style={{ transform: `translateY(${drainY}px)`, transition: 'transform 0.5s linear' }}>
          <SwayingSurface>
            <path d={MILK_GENTLE_SURFACE_PATH} transform="translate(-95 22)" fill="white" />
          </SwayingSurface>
        </g>
      </g>

      <path
        d={GLASS_RIM_AND_EDGE_PATH}
        transform="translate(4 4)"
        opacity="0.75"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d={GLASS_OPEN_RIM_PATH}
        transform="translate(5 -2)"
        opacity="0.8"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d={PRINTED_COW_MARK_PATH}
        transform="translate(48.75 108)"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#00234E"
      />
      <path d={GLASS_REFLECTION_PATH} transform="translate(17 24)" opacity="0.35" fill="white" />
      <path d={GLASS_FINE_EDGE_REFLECTION_PATH} transform="translate(127 32)" opacity="0.4" fill="white" />
      <path
        d={MILK_MOUSTACHE_PATH}
        transform="translate(66 132)"
        fill="white"
        style={{ opacity: isMoustacheVisible ? 1 : 0, transition: 'opacity 0.5s ease-out' }}
      />
    </Vessel>
  )
}

const sway = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(12px); }
  75% { transform: translateX(-12px); }
  100% { transform: translateX(0); }
`

const Vessel = styled.svg`
  width: 100%;
  max-width: ${VESSEL_WIDTH}px;
  height: auto;
`

const SwayingSurface = styled.g`
  animation: ${sway} 6s ease-in-out infinite;
`
