import { createContext, useContext } from 'react'

/** Nesting depth for stacked anchor dropdowns (e.g. settings panel + Select). Default at app root. */
export const SmartModalLayerContext = createContext(0)

export function useSmartModalLayerDepth(): number {
  return useContext(SmartModalLayerContext)
}
