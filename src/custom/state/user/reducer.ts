import { ALL_SUPPORTED_CHAIN_IDS } from '@cowprotocol/cow-sdk'
import { createReducer } from '@reduxjs/toolkit'
import { COMMON_BASES } from 'constants/routing'
import { SupportedLocale } from 'constants/locales'

import { DEFAULT_DEADLINE_FROM_NOW } from 'constants/misc'
import { updateVersion } from '../global/actions'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedPair,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateHideClosedPositions,
  updateMatchesDarkMode,
  updateShowSurveyPopup,
  updateUserClientSideRouter,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserSlippageTolerance,
  // TODO: mod, shouldn't be here
  toggleURLWarning,
  updateUserLocale,
  // TODO: mod, shouldn't be here
  updateRecipientToggleVisible,
  // mod, favourite tokens
  toggleFavouriteToken,
  removeAllFavouriteTokens,
} from './actions'
import { serializeToken } from './hooks'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number

  matchesDarkMode: boolean // whether the dark mode media query matches

  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  userLocale: SupportedLocale | null

  userExpertMode: boolean

  // TODO: mod, shouldn't be here
  recipientToggleVisible: boolean

  userClientSideRouter: boolean // whether routes should be calculated with the client side router only

  // hides closed (inactive) positions across the app
  userHideClosedPositions: boolean

  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number | 'auto'
  userSlippageToleranceHasBeenMigratedToAuto: boolean // temporary flag for migration status

  // deadline set by user in minutes, used in all txns
  userDeadline: number

  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken
    }
  }

  pairs: {
    [chainId: number]: {
      // keyed by token0Address:token1Address
      [key: string]: SerializedPair
    }
  }

  timestamp: number
  URLWarningVisible: boolean

  // undefined means has not gone through A/B split yet
  showSurveyPopup: boolean | undefined

  // mod, favourite tokens
  favouriteTokens: {
    [chainId: number]: {
      [address: string]: SerializedToken
    }
  }
}

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`
}

function _initialSavedTokensState() {
  return ALL_SUPPORTED_CHAIN_IDS.reduce((acc, chain) => {
    acc[chain] = COMMON_BASES[chain].reduce(
      (acc2, curr) => {
        acc2[curr.wrapped.address] = serializeToken(curr.wrapped)
        return acc2
      },
      {} as {
        [address: string]: SerializedToken
      }
    )
    return acc
  }, {} as UserState['favouriteTokens'])
}

export const initialState: UserState = {
  matchesDarkMode: false,
  userDarkMode: null,
  userExpertMode: false,
  // TODO: mod, shouldn't be here
  recipientToggleVisible: false,
  userLocale: null,
  userClientSideRouter: false,
  userHideClosedPositions: false,
  userSlippageTolerance: 'auto',
  userSlippageToleranceHasBeenMigratedToAuto: true,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  tokens: {},
  pairs: {},
  timestamp: currentTimestamp(),
  URLWarningVisible: true,
  showSurveyPopup: undefined,
  // mod, favourite tokens
  favouriteTokens: _initialSavedTokensState(),
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateVersion, (state) => {
      // slippage isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (
        typeof state.userSlippageTolerance !== 'number' ||
        !Number.isInteger(state.userSlippageTolerance) ||
        state.userSlippageTolerance < 0 ||
        state.userSlippageTolerance > 5000
      ) {
        state.userSlippageTolerance = 'auto'
      } else {
        if (
          !state.userSlippageToleranceHasBeenMigratedToAuto &&
          [10, 50, 100].indexOf(state.userSlippageTolerance) !== -1
        ) {
          state.userSlippageTolerance = 'auto'
          state.userSlippageToleranceHasBeenMigratedToAuto = true
        }
      }

      // deadline isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (
        typeof state.userDeadline !== 'number' ||
        !Number.isInteger(state.userDeadline) ||
        state.userDeadline < 60 ||
        state.userDeadline > 180 * 60
      ) {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
      }

      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
    .addCase(updateUserDarkMode, (state, action) => {
      state.userDarkMode = action.payload.userDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateMatchesDarkMode, (state, action) => {
      state.matchesDarkMode = action.payload.matchesDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserExpertMode, (state, action) => {
      state.userExpertMode = action.payload.userExpertMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateRecipientToggleVisible, (state, action) => {
      state.recipientToggleVisible = action.payload.recipientToggleVisible
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserLocale, (state, action) => {
      state.userLocale = action.payload.userLocale
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserDeadline, (state, action) => {
      state.userDeadline = action.payload.userDeadline
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserClientSideRouter, (state, action) => {
      state.userClientSideRouter = action.payload.userClientSideRouter
    })
    .addCase(updateHideClosedPositions, (state, action) => {
      state.userHideClosedPositions = action.payload.userHideClosedPositions
    })
    .addCase(updateShowSurveyPopup, (state, action) => {
      state.showSurveyPopup = action.payload.showSurveyPopup
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      if (!state.tokens) {
        state.tokens = {}
      }
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {}
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      if (!state.tokens) {
        state.tokens = {}
      }
      state.tokens[chainId] = state.tokens[chainId] || {}
      delete state.tokens[chainId][address]
      state.timestamp = currentTimestamp()
    })
    .addCase(addSerializedPair, (state, { payload: { serializedPair } }) => {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        const chainId = serializedPair.token0.chainId
        state.pairs[chainId] = state.pairs[chainId] || {}
        state.pairs[chainId][pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedPair, (state, { payload: { chainId, tokenAAddress, tokenBAddress } }) => {
      if (state.pairs[chainId]) {
        // just delete both keys if either exists
        delete state.pairs[chainId][pairKey(tokenAAddress, tokenBAddress)]
        delete state.pairs[chainId][pairKey(tokenBAddress, tokenAAddress)]
      }
      state.timestamp = currentTimestamp()
    })
    // MOD - legacy Uni code we want to keep
    .addCase(toggleURLWarning, (state) => {
      state.URLWarningVisible = !state.URLWarningVisible
    })
    // MOD - to add/remove favourite token based on if its already added or not
    .addCase(toggleFavouriteToken, (state, { payload: { serializedToken } }) => {
      const { chainId, address } = serializedToken

      if (!state.favouriteTokens?.[chainId]) {
        state.favouriteTokens = _initialSavedTokensState()
      }

      if (!state.favouriteTokens[chainId][address]) {
        state.favouriteTokens[chainId][address] = serializedToken
      } else {
        delete state.favouriteTokens[chainId][address]
      }
    })
    .addCase(removeAllFavouriteTokens, (state, { payload: { chainId } }) => {
      state.favouriteTokens = _initialSavedTokensState()
    })
)
