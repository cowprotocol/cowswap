import { DEFAULT_DEADLINE_FROM_NOW, SupportedLocale } from '@cowprotocol/common-const'
import { ConnectionType } from '@cowprotocol/wallet'

import { createSlice } from '@reduxjs/toolkit'

import { userWalletMigration } from './userWalletMigration'

userWalletMigration()

export interface UserState {
  selectedWallet?: ConnectionType

  matchesDarkMode: boolean // whether the dark mode media query matches

  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  userLocale: SupportedLocale | null

  // TODO: mod, shouldn't be here
  recipientToggleVisible: boolean

  // deadline set by user in minutes, used in all txns
  userDeadline: number
}

export const initialState: UserState = {
  selectedWallet: undefined,
  matchesDarkMode: false,
  userDarkMode: null,
  // TODO: mod, shouldn't be here
  recipientToggleVisible: false,
  userLocale: null,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateSelectedWallet(state, { payload: { wallet } }) {
      state.selectedWallet = wallet
    },
    updateUserDarkMode(state, action) {
      state.userDarkMode = action.payload.userDarkMode
    },
    updateMatchesDarkMode(state, action) {
      state.matchesDarkMode = action.payload.matchesDarkMode
    },
    updateUserLocale(state, action) {
      state.userLocale = action.payload.userLocale
    },
    updateUserDeadline(state, action) {
      state.userDeadline = action.payload.userDeadline
    },
    updateRecipientToggleVisible(state, action) {
      state.recipientToggleVisible = action.payload.recipientToggleVisible
    },
  },
})

export const {
  updateSelectedWallet,
  updateMatchesDarkMode,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserLocale,
  updateRecipientToggleVisible,
} = userSlice.actions
export default userSlice.reducer
