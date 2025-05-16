import { lazy } from 'react'

export { BridgeAccordionSummary } from './pure/BridgeAccordionSummary'
export { useBridgeProvider } from './hooks/useBridgeProvider'
export { useBridgeSupportedTokens } from './hooks/useBridgeSupportedTokens'
export { useBridgeSupportedNetworks } from './hooks/useBridgeSupportedNetworks'
export { useBridgeProviderDetails } from './hooks/useBridgeProviderDetails'

// Constants
export {
  BridgeProvider,
  BRIDGE_PROVIDER_DETAILS,
  BRIDGE_PROVIDER_DETAILS_ARRAY,
  getBridgeProviderDetails,
} from './constants/bridgeProviders'

export {
  SwapStatusIcons,
  BridgeStatusIcons,
  SwapStatusTitlePrefixes,
  BridgeStatusTitlePrefixes,
} from './pure/StopStatus'

// Types
export * from './types'

// Lazy-loaded components for code-splitting
// These will only be loaded when actually used in the application
export const BridgeRouteBreakdown = lazy(() =>
  import('./containers/BridgeRouteBreakdown').then((module) => ({
    default: module.BridgeRouteBreakdown,
  })),
)

export const BridgeStopDetails = lazy(() =>
  import('./pure/BridgeStopDetails').then((module) => ({
    default: module.BridgeStopDetails,
  })),
)

export const SwapStopDetails = lazy(() =>
  import('./pure/SwapStopDetails').then((module) => ({
    default: module.SwapStopDetails,
  })),
)
