import { createSlice } from '@reduxjs/toolkit'

import { initialState } from './initialState'

export enum ApplicationModal {
  NETWORK_SELECTOR,
  SETTINGS,
  WALLET,
  // -----------------      MOD: CowSwap specific modals      --------------------
  TRANSACTION_ERROR,
  COW_SUBSIDY,
  CANCELLATION,
  CONFIRMATION,
  MULTIPLE_CANCELLATION,
  // ------------------------------------------------------------------------------
}

export interface ApplicationState {
  readonly openModal: ApplicationModal | null
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setOpenModal(state, action) {
      state.openModal = action.payload
    },
  },
})

export const { setOpenModal } = applicationSlice.actions
export default applicationSlice.reducer
