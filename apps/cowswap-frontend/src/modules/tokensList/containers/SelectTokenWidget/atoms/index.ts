import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { ListState } from '@cowprotocol/tokens'

import { CustomFlowsRegistry } from '../types'

/**
 * Modal-level UI state for SelectTokenWidget.
 */
export interface SelectTokenModalUIState {
  /** Whether the manage lists/tokens widget is open */
  isManageWidgetOpen: boolean
}

export const DEFAULT_MODAL_UI_STATE: SelectTokenModalUIState = {
  isManageWidgetOpen: false,
}

export const { atom: selectTokenModalUIAtom, updateAtom: updateSelectTokenModalUIAtom } = atomWithPartialUpdate(
  atom<SelectTokenModalUIState>(DEFAULT_MODAL_UI_STATE),
)

/**
 * Custom flows registry atom.
 * Allows external code to inject pre/post flows for any token selector view.
 */
export const customFlowsRegistryAtom = atom<CustomFlowsRegistry>({})

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
