import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

/**
 * Modal-level UI state for SelectTokenWidget.
 */
export interface SelectTokenModalUIState {
  /** Whether the mobile chain panel overlay is open */
  isMobileChainPanelOpen: boolean
  /** Whether the manage lists/tokens widget is open */
  isManageWidgetOpen: boolean
}

export const DEFAULT_MODAL_UI_STATE: SelectTokenModalUIState = {
  isMobileChainPanelOpen: false,
  isManageWidgetOpen: false,
}

export const { atom: selectTokenModalUIAtom, updateAtom: updateSelectTokenModalUIAtom } = atomWithPartialUpdate(
  atom<SelectTokenModalUIState>(DEFAULT_MODAL_UI_STATE),
)
