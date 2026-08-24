import { useCallback, useEffect, useRef, useState } from 'react'

import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAINS_MAP } from '@cowprotocol/cow-sdk'
import { CowWidgetEventListener, CowWidgetEvents, OnTransactionPayload } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from '../../../widgetEventEmitter'
import { AssistantProposal } from '../types'

export interface WrapWatch {
  /** Timestamp of the completed wrap, or null. One-shot: cleared once consumed. */
  completed: number | null
  /** Call after applying a proposal. Ignores anything that isn't a wrap. */
  watch(proposal: AssistantProposal): void
  clear(): void
}

/**
 * Notices when a wrap the assistant proposed actually lands on chain.
 *
 * Wrapping is step one of two, and without this the sequence dead-ends: the user
 * wraps, then has to work out for themselves that they should ask again for the
 * limit order they already agreed to. With it, the panel can send a hidden turn and
 * the assistant carries straight on to step two.
 *
 * **Keyed on `receipt.to`, not the summary string.** A wrap calls `deposit()` on the
 * wrapped-native contract, so the recipient IS the token we asked to buy — an
 * identity check, rather than parsing UI copy that can be reworded.
 *
 * The same event the widget build listened to; in-app it arrives on the app's own
 * emitter, which `OnchainTransactionEventsUpdater` publishes to.
 */
export function useWrapWatch(): WrapWatch {
  const [completed, setCompleted] = useState<number | null>(null)
  const pending = useRef<string | null>(null)

  useEffect(() => {
    const listener: CowWidgetEventListener = {
      event: CowWidgetEvents.ON_ONCHAIN_TRANSACTION,
      handler(payload: OnTransactionPayload) {
        const target = pending.current
        if (!target) return

        const { receipt } = payload
        // The app's own success test (OnchainTransactionEventsUpdater): a replaced
        // or cancelled transaction is not a wrap that happened.
        if (receipt.status !== 1 || receipt.replacementType === 'cancel') return
        if (String(receipt.to).toLowerCase() !== target.toLowerCase()) return

        pending.current = null
        setCompleted(Date.now())
      },
    }

    WIDGET_EVENT_EMITTER.on(listener)
    return () => {
      WIDGET_EVENT_EMITTER.off(listener)
    }
  }, [])

  const watch = useCallback((proposal: AssistantProposal): void => {
    // Any new proposal supersedes an outstanding wrap watch, including a non-wrap:
    // if they've moved on, the old sequence is over.
    pending.current = wrappedTargetOf(proposal)
  }, [])

  const clear = useCallback((): void => setCompleted(null), [])

  return { completed, watch, clear }
}

/**
 * Is this proposal the wrap half of a wrap-then-limit sequence?
 *
 * Native → wrapped native on the same chain. Both read from the SDK, so it holds on
 * every chain: xDAI → WXDAI on Gnosis, POL → WPOL on Polygon.
 */
function wrappedTargetOf(proposal: AssistantProposal): string | null {
  if (proposal.orderType !== 'swap') return null

  const chain = ALL_SUPPORTED_CHAINS_MAP[proposal.chainId as keyof typeof ALL_SUPPORTED_CHAINS_MAP]
  if (!chain || proposal.sellToken !== chain.nativeCurrency.symbol) return null

  const wrapped = WRAPPED_NATIVE_CURRENCIES[proposal.chainId as keyof typeof WRAPPED_NATIVE_CURRENCIES]
  if (!wrapped) return null

  return proposal.buyToken.toLowerCase() === wrapped.address.toLowerCase() ? wrapped.address : null
}
