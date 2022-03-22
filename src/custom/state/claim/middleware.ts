import { isAnyOf, Middleware } from '@reduxjs/toolkit'
import { getCowSoundSend, getCowSoundSuccessClaim } from 'utils/sound'
import { AppState } from 'state'
import { addTransaction, finalizeTransaction } from '../enhancedTransactions/actions'
import { ClaimStatus, setClaimStatus, setSwapVCowStatus, SwapVCowStatus } from './actions'

const isFinalizeTransaction = isAnyOf(finalizeTransaction)
const isAddTransaction = isAnyOf(addTransaction)

// Watch for claim tx being finalized and triggers a change of status
export const claimMinedMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  let cowSound
  if (isAddTransaction(action)) {
    const { chainId, hash } = action.payload
    const transaction = store.getState().transactions[chainId][hash]

    if (transaction.claim) {
      console.debug('[stat:claim:middleware] Claim transaction sent', transaction.hash, transaction.claim)
      cowSound = getCowSoundSend()
    }
  } else if (isFinalizeTransaction(action)) {
    const { chainId, hash } = action.payload
    const transaction = store.getState().transactions[chainId][hash]

    if (transaction.claim) {
      const status = transaction.receipt?.status
      console.debug(
        `[stat:claim:middleware] Claim transaction finalized withs status ${status}`,
        transaction.hash,
        transaction.claim
      )
      if (status === 1 && transaction.replacementType !== 'cancel') {
        // success
        store.dispatch(setClaimStatus(ClaimStatus.CONFIRMED))
        cowSound = getCowSoundSuccessClaim()
      } else {
        // not success...
        store.dispatch(setClaimStatus(ClaimStatus.FAILED))
      }
    } else if (transaction.swapVCow) {
      const status = transaction.receipt?.status
      console.debug(
        `[stat:claim:middleware] Swap vCow for Cow transaction finalized with status ${status}`,
        transaction.hash
      )
      if (status === 1) {
        store.dispatch(setSwapVCowStatus(SwapVCowStatus.INITIAL))
      }
    }
  }

  if (cowSound) {
    cowSound.play().catch((e) => {
      console.error('🐮 [Claiming] Moooooo cannot be played', e)
    })
  }

  return result
}
