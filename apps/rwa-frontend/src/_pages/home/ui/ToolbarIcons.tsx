import type { ReactNode } from 'react'

const STROKE_PROPS = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function CommoditiesIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 14.667 2.333 11.5V4.833L8 1.667l5.667 3.166V11.5L8 14.667Z" {...STROKE_PROPS} />
      <path d="M2.5 4.917 8 8l5.5-3.083M8 8v6.5" {...STROKE_PROPS} />
    </svg>
  )
}

export function EtfsIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.667 1.667 4.833 8 8l6.333-3.167L8 1.667Z" {...STROKE_PROPS} />
      <path d="M1.667 11.167 8 14.333l6.333-3.166" {...STROKE_PROPS} />
      <path d="M1.667 8 8 11.167 14.333 8" {...STROKE_PROPS} />
    </svg>
  )
}

export function FilterIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M14.667 2H1.333l5.334 6.307V12.667L9.333 14V8.307L14.667 2Z" {...STROKE_PROPS} />
    </svg>
  )
}

export function StocksIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M14.667 4.667 9 10.333 5.667 7l-4.334 4.333" {...STROKE_PROPS} />
      <path d="M10.667 4.667h4v4" {...STROKE_PROPS} />
    </svg>
  )
}
