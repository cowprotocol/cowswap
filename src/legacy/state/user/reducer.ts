import { createSlice } from '@reduxjs/toolkit'
import { ConnectionType } from 'modules/wallet'
import { SupportedLocale } from 'constants/locales'

import { DEFAULT_DEADLINE_FROM_NOW } from 'constants/misc'
import { updateVersion } from 'state/global/actions'
import { SerializedPair, SerializedToken } from 'state/user/types'

// MOD imports
// import { serializeToken } from './hooks'
import { COMMON_BASES } from 'constants/routing'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  // We want the user to be able to define which wallet they want to use, even if there are multiple connected wallets via web3-react.
  // If a user had previously connected a wallet but didn't have a wallet override set (because they connected prior to this field being added),
  // we want to handle that case by backfilling them manually. Once we backfill, we set the backfilled field to `true`.
  // After some period of time, our active users will have this property set so we can likely remove the backfilling logic.
  selectedWalletBackfilled: boolean
  selectedWallet?: ConnectionType

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

  showDonationLink: boolean

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

// TODO: replace by the function from state/user/hooks.ts
function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

function _initialStatePerChain(chainId: number) {
  return COMMON_BASES[chainId].reduce(
    (acc2, curr) => {
      acc2[curr.wrapped.address] = serializeToken(curr.wrapped)
      return acc2
    },
    {} as {
      [address: string]: SerializedToken
    }
  )
}

const ALL_SUPPORTED_CHAIN_IDS = [SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN, SupportedChainId.GOERLI]

function _initialSavedTokensState() {
  return ALL_SUPPORTED_CHAIN_IDS.reduce((acc, chain) => {
    acc[chain] = _initialStatePerChain(chain)
    return acc
  }, {} as UserState['favouriteTokens'])
}

export const initialState: UserState = {
  selectedWallet: undefined,
  selectedWalletBackfilled: false,
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
  showDonationLink: true,
  // mod, favourite tokens
  favouriteTokens: _initialSavedTokensState(),
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
      state.timestamp = currentTimestamp()
    },
    updateMatchesDarkMode(state, action) {
      state.matchesDarkMode = action.payload.matchesDarkMode
      state.timestamp = currentTimestamp()
    },
    updateUserExpertMode(state, action) {
      state.userExpertMode = action.payload.userExpertMode
      state.timestamp = currentTimestamp()
    },
    updateUserLocale(state, action) {
      state.userLocale = action.payload.userLocale
      state.timestamp = currentTimestamp()
    },
    updateUserSlippageTolerance(state, action) {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    },
    updateUserDeadline(state, action) {
      state.userDeadline = action.payload.userDeadline
      state.timestamp = currentTimestamp()
    },
    updateUserClientSideRouter(state, action) {
      state.userClientSideRouter = action.payload.userClientSideRouter
    },
    updateHideClosedPositions(state, action) {
      state.userHideClosedPositions = action.payload.userHideClosedPositions
    },
    updateShowSurveyPopup(state, action) {
      state.showSurveyPopup = action.payload.showSurveyPopup
    },
    updateShowDonationLink(state, action) {
      state.showDonationLink = action.payload.showDonationLink
    },
    addSerializedToken(state, { payload: { serializedToken } }) {
      if (!state.tokens) {
        state.tokens = {}
      }
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {}
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken
      state.timestamp = currentTimestamp()
    },
    removeSerializedToken(state, { payload: { address, chainId } }) {
      if (!state.tokens) {
        state.tokens = {}
      }
      state.tokens[chainId] = state.tokens[chainId] || {}
      delete state.tokens[chainId][address]
      state.timestamp = currentTimestamp()
    },
    addSerializedPair(state, { payload: { serializedPair } }) {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        const chainId = serializedPair.token0.chainId
        state.pairs[chainId] = state.pairs[chainId] || {}
        state.pairs[chainId][pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair
      }
      state.timestamp = currentTimestamp()
    },
    removeSerializedPair(state, { payload: { chainId, tokenAAddress, tokenBAddress } }) {
      if (state.pairs[chainId]) {
        // just delete both keys if either exists
        delete state.pairs[chainId][pairKey(tokenAAddress, tokenBAddress)]
        delete state.pairs[chainId][pairKey(tokenBAddress, tokenAAddress)]
      }
      state.timestamp = currentTimestamp()
    },
    // MOD - legacy Uni code we want to keep
    toggleURLWarning(state) {
      state.URLWarningVisible = !state.URLWarningVisible
    },
    updateRecipientToggleVisible(state, action) {
      state.recipientToggleVisible = action.payload.recipientToggleVisible
      state.timestamp = currentTimestamp()
    },
    initFavouriteTokens(state, { payload: { chainId } }) {
      if (!state.favouriteTokens?.[chainId]) {
        state.favouriteTokens = _initialSavedTokensState()
      }
    },
    toggleFavouriteToken(state, { payload: { serializedToken } }) {
      const { chainId, address } = serializedToken

      if (!state.favouriteTokens?.[chainId]) {
        state.favouriteTokens = _initialSavedTokensState()
      }

      if (!state.favouriteTokens[chainId][address]) {
        state.favouriteTokens[chainId][address] = serializedToken
      } else {
        delete state.favouriteTokens[chainId][address]
      }
    },
    removeAllFavouriteTokens(state, { payload: { chainId } }) {
      state.favouriteTokens[chainId] = _initialStatePerChain(chainId)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
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
  },
})

export const {
  updateSelectedWallet,
  addSerializedPair,
  addSerializedToken,
  removeSerializedPair,
  removeSerializedToken,
  updateHideClosedPositions,
  updateMatchesDarkMode,
  updateShowDonationLink,
  updateShowSurveyPopup,
  updateUserClientSideRouter,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserLocale,
  updateUserSlippageTolerance,
  // MOD - legacy Uni code we want to keep
  updateRecipientToggleVisible,
  toggleURLWarning,
  toggleFavouriteToken,
  removeAllFavouriteTokens,
  initFavouriteTokens,
} = userSlice.actions
export default userSlice.reducer
