import { DEFAULT_DEADLINE_FROM_NOW, SupportedLocale } from '@cowprotocol/common-const'
import { ConnectionType } from '@cowprotocol/wallet'

import { createSlice } from '@reduxjs/toolkit'

export interface UserState {
  // We want the user to be able to define which wallet they want to use, even if there are multiple connected wallets via web3-react.
  // If a user had previously connected a wallet but didn't have a wallet override set (because they connected prior to this field being added),
  // we want to handle that case by backfilling them manually. Once we backfill, we set the backfilled field to `true`.
  // After some period of time, our active users will have this property set so we can likely remove the backfilling logic.
  selectedWalletBackfilled: boolean
  selectedWallet?: ConnectionType

  matchesDarkMode: boolean // whether the dark mode media query matches

  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  userLocale: SupportedLocale | null

  // TODO: mod, shouldn't be here
  recipientToggleVisible: boolean

  // user defined slippage tolerance in bps, used in all txns
  userSlippageTolerance: number | 'auto'

  // deadline set by user in minutes, used in all txns
  userDeadline: number
}

export const initialState: UserState = {
  selectedWallet: undefined,
  selectedWalletBackfilled: false,
  matchesDarkMode: false,
  userDarkMode: null,
  // TODO: mod, shouldn't be here
  recipientToggleVisible: false,
  userLocale: null,
  userSlippageTolerance: 'auto',
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateSelectedWallet(state, { payload: { wallet } }) {
      state.selectedWallet = wallet
      state.selectedWalletBackfilled = true
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
    updateUserSlippageTolerance(state, action) {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
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
  updateUserSlippageTolerance,
  updateRecipientToggleVisible,
} = userSlice.actions
export default userSlice.reducer
