import { atom } from 'jotai'

import { ListState } from '@cowprotocol/tokens'

/**
 * Pending list toggle consent state.
 * Set when user tries to enable a restricted list and consent is required.
 */
export interface PendingListToggleConsent {
  list: ListState
  consentHash: string
  onConfirm: () => void
  onCancel: () => void
}

export const pendingListToggleConsentAtom = atom<PendingListToggleConsent | null>(null)
