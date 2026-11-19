import { SupportedLocale } from '@cowprotocol/common-const'
import { ConnectionType } from '@cowprotocol/wallet'

import { createSlice } from '@reduxjs/toolkit'

export interface UserState {
  selectedWallet?: ConnectionType
  matchesDarkMode: boolean // whether the dark mode media query matches
  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  userLocale: SupportedLocale | null
  hooksEnabled: boolean
}

/**
 * Read at load rather than left to `UserUpdater`, whose effect runs after the first paint. Starting
 * from `false` made a first visit in a dark system render the light theme for a moment.
 */
function matchesSystemDarkMode(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export const initialState: UserState = {
  selectedWallet: undefined,
  matchesDarkMode: matchesSystemDarkMode(),
  userDarkMode: null,
  // TODO: mod, shouldn't be here
  hooksEnabled: false,
  userLocale: null,
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
    updateHooksEnabled(state, action) {
      state.hooksEnabled = action.payload.hooksEnabled
    },
    updateMatchesDarkMode(state, action) {
      state.matchesDarkMode = action.payload.matchesDarkMode
    },
    updateUserLocale(state, action) {
      state.userLocale = action.payload.userLocale
    },
  },
})

export const { updateSelectedWallet, updateMatchesDarkMode, updateUserDarkMode, updateHooksEnabled, updateUserLocale } =
  userSlice.actions
export default userSlice.reducer
