import { getCowSoundError, getCowSoundSuccess } from '@cowprotocol/common-utils'

import { isAnyOf, Middleware } from '@reduxjs/toolkit'

import { setSwapVCowStatus, SwapVCowStatus } from './actions'

import { finalizeTransaction } from '../enhancedTransactions/actions'
import { AppState } from '../index'

const isFinalizeTransaction = isAnyOf(finalizeTransaction)

// Watch for swapVCow tx being finalized and triggers a change of status
export const cowTokenMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  let cowSound

  if (isFinalizeTransaction(action)) {
    const { chainId, hash } = action.payload
    const transaction = store.getState().transactions[chainId][hash]

    const { userDarkMode, matchesDarkMode } = store.getState().user
    const isDarkMode = userDarkMode === null ? matchesDarkMode : userDarkMode

    if (transaction.swapVCow || transaction.swapLockedGNOvCow) {
      const status = transaction.receipt?.status

      console.debug(
        `[stat:swapVCow:middleware] Convert vCOW to COW transaction finalized with status ${status}`,
        transaction.hash
      )

      if (status === 1 && transaction.replacementType !== 'cancel') {
        cowSound = getCowSoundSuccess(isDarkMode)

        if (transaction.swapVCow) {
          store.dispatch(setSwapVCowStatus(SwapVCowStatus.CONFIRMED))
        }
      } else {
        cowSound = getCowSoundError(isDarkMode)

        if (transaction.swapVCow) {
          store.dispatch(setSwapVCowStatus(SwapVCowStatus.INITIAL))
        }
      }
    }
  }

  if (cowSound) {
    cowSound.play().catch((e) => {
      console.error('🐮 [middleware::swapVCow] Moooooo cannot be played', e)
    })
  }

  return result
}
