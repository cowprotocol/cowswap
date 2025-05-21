import { lazy } from 'react'

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
