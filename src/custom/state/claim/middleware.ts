import { Middleware, isAnyOf } from '@reduxjs/toolkit'
import { getCowSoundSuccess, getCowSoundSend } from 'utils/sound'
import { AppState } from 'state'
import { finalizeTransaction, addTransaction } from '../enhancedTransactions/actions'
import { setClaimStatus, ClaimStatus } from './actions'

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
      console.debug('[stat:claim:middleware] Claim transaction finalized', transaction.hash, transaction.claim)
      store.dispatch(setClaimStatus(ClaimStatus.CONFIRMED))
      cowSound = getCowSoundSuccess()
    }
  }

  if (cowSound) {
    cowSound.play().catch((e) => {
      console.error('🐮 [Claiming] Moooooo cannot be played', e)
    })
  }

  return result
}
