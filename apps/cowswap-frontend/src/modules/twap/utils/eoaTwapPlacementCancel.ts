/**
 * Cancels the in-flight EOA TWAP placement/signing UI updates.
 * Wallet / on-chain work may still complete; this only stops signing-step
 * state from being repopulated after the user dismisses the confirm modal.
 */
let placementController: AbortController | null = null

export class EoaTwapPlacementCancelledError extends Error {
  constructor() {
    super('EOA TWAP placement cancelled')
    this.name = 'EoaTwapPlacementCancelledError'
  }
}

export function cancelEoaTwapPlacement(): void {
  placementController?.abort()
}

export function isEoaTwapPlacementCancelled(): boolean {
  return placementController?.signal.aborted ?? false
}

export function startEoaTwapPlacement(): void {
  placementController?.abort()
  placementController = new AbortController()
}
