import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

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
