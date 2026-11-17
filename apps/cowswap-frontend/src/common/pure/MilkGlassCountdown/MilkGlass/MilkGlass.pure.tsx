import { forwardRef, memo, ReactNode, useCallback, useId, useImperativeHandle, useLayoutEffect, useRef } from 'react'

import * as styledEl from './MilkGlass.styled'

export interface MilkGlassHandle {
  setFraction: (fraction: number) => void
}

export interface MilkGlassProps {
  /** Initial / static fill level (0..1). Prefer `ref.setFraction` for ticking updates. */
  fraction?: number

  /** Recolors the glass for the amber expired hero; reflections stay white in both. */
  isExpired?: boolean
}

export const MilkGlass = memo(
  forwardRef<MilkGlassHandle, MilkGlassProps>(function MilkGlass({ fraction = 0, isExpired = false }, ref): ReactNode {
    const clipPathId = useId()
    const drainRef = useRef<SVGGElement>(null)
    const moustacheRef = useRef<SVGPathElement>(null)

    const applyFraction = useCallback((nextFraction: number): void => {
      const level = Math.min(1, Math.max(0, nextFraction))
      const drain = drainRef.current
      if (drain) {
        drain.style.transform = `translateY(${(1 - level) * styledEl.DRAIN_TRAVEL_PX}px)`
      }

      const moustache = moustacheRef.current
      if (moustache) {
        // The design fades the moustache in over the last fifth of the window and out again just before zero.
        moustache.style.opacity = level > 0.03 && level <= 0.2 ? '1' : '0'
      }
    }, [])

    useImperativeHandle(ref, () => ({ setFraction: applyFraction }), [applyFraction])

    useLayoutEffect(() => {
      applyFraction(fraction)
    }, [fraction, applyFraction])

    const strokeColor = isExpired ? styledEl.EXPIRED_INK : 'white'
    const markColor = isExpired ? styledEl.EXPIRED_INK : '#00234E'

    return (
      <styledEl.Vessel
        viewBox={`0 0 ${styledEl.VESSEL_WIDTH} ${styledEl.VESSEL_HEIGHT}`}
        role="img"
        aria-hidden="true"
        overflow="visible"
      >
        <defs>
          <clipPath id={clipPathId}>
            <path d={styledEl.INNER_GLASS_MASK_PATH} transform="translate(11 8)" />
          </clipPath>
        </defs>

        <ellipse cx="75" cy="205.5" rx="58" ry="4.5" opacity="0.1" fill={markColor} />
        <path d={styledEl.GLASS_SILHOUETTE_PATH} transform="translate(5 4)" opacity="0.12" fill="white" />

        <g clipPath={`url(#${clipPathId})`}>
          <g ref={drainRef} style={{ transition: 'transform 1s linear' }}>
            <styledEl.SwayingSurface>
              <path d={styledEl.MILK_GENTLE_SURFACE_PATH} transform="translate(-95 22)" fill="white" />
            </styledEl.SwayingSurface>
          </g>
        </g>

        <path
          d={styledEl.GLASS_RIM_AND_EDGE_PATH}
          transform="translate(4 4)"
          opacity="0.75"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
        />
        <path
          d={styledEl.GLASS_OPEN_RIM_PATH}
          transform="translate(5 -2)"
          opacity="0.8"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
        />
        <path
          d={styledEl.PRINTED_COW_MARK_PATH}
          transform="translate(48.75 108)"
          fillRule="evenodd"
          clipRule="evenodd"
          fill={markColor}
        />
        <path d={styledEl.GLASS_REFLECTION_PATH} transform="translate(17 24)" opacity="0.35" fill="white" />
        <path d={styledEl.GLASS_FINE_EDGE_REFLECTION_PATH} transform="translate(127 32)" opacity="0.4" fill="white" />
        <path
          d={styledEl.MILK_MOUSTACHE_PATH}
          transform="translate(66 132)"
          fill="white"
          ref={moustacheRef}
          style={{ transition: 'opacity 0.5s ease-out' }}
        />
      </styledEl.Vessel>
    )
  }),
)
