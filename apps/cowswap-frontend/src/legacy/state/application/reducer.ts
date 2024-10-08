import { createSlice } from '@reduxjs/toolkit'

import { initialState } from './initialState'

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

export interface ApplicationState {
  openModal: ApplicationModal | null
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
