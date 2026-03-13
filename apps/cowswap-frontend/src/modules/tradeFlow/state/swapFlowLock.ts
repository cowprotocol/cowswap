/**
 * App-wide lock so only one swap/bridge flow runs at a time.
 * Prevents multiple signature popups from concurrent flows or re-renders.
 */
let swapFlowInProgress = false

export function acquireSwapFlowLock(): boolean {
  if (swapFlowInProgress) return false
  swapFlowInProgress = true
  return true
}

export function releaseSwapFlowLock(): void {
  swapFlowInProgress = false
}

export function isSwapFlowInProgress(): boolean {
  return swapFlowInProgress
}
