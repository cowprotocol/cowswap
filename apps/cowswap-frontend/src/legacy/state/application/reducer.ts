import { createSlice } from '@reduxjs/toolkit'

import { initialState } from './initialState'

export interface ApplicationState {
  openModal: ApplicationModal | null
}

export enum ApplicationModal {
  NETWORK_SELECTOR,
  WALLET,
  // -----------------      MOD: CowSwap specific modals      --------------------
  TRANSACTION_ERROR,
  COW_SUBSIDY,
  CANCELLATION,
  CONFIRMATION,
  MULTIPLE_CANCELLATION,
  // ------------------------------------------------------------------------------
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

export default applicationSlice.reducer
