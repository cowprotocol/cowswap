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
  readonly chainId: number | null
  readonly openModal: ApplicationModal | null
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    updateChainId(state, action) {
      const { chainId } = action.payload
      state.chainId = chainId
    },
    setOpenModal(state, action) {
      state.openModal = action.payload
    },
  },
})

export const { updateChainId, setOpenModal } = applicationSlice.actions
export default applicationSlice.reducer
