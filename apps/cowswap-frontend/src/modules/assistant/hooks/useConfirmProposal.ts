import { useCallback, useEffect, useState } from 'react'

import { useApplyProposal } from './useApplyProposal'
import { LandedStatus } from './useProposalLanded'
import { QuoteWatchState } from './useQuoteWatch'
import { WrapWatch } from './useWrapWatch'

import { AssistantProposal } from '../types'

export interface ConfirmProposal {
  confirm(): void
  /** In flight — usually waiting on a wallet network switch. */
  applying: boolean
  problem: string | null
}

/** How long the form gets to show the applied trade before we call it a failure. */
const LANDING_GRACE_MS = 4000

interface ConfirmProposalParams {
  landed: LandedStatus
  markApplied(): void
  proposal: AssistantProposal | null
  quoteWatch: QuoteWatchState
  wrapWatch: WrapWatch
}

/**
 * Pressing Confirm: apply the trade, then arm the watches that follow it.
 *
 * Its own hook because applying became asynchronous — a proposal on another chain
 * waits for the wallet to agree to switch — and the promise handling, the in-flight
 * flag and the failure message together are more than the drawer should carry.
 *
 * The watches are armed only after a successful apply. Arming them for a trade that
 * never landed would leave them waiting for signals about a trade that doesn't
 * exist, and eventually commenting on an unrelated one.
 */
export function useConfirmProposal({
  landed,
  markApplied,
  proposal,
  quoteWatch,
  wrapWatch,
}: ConfirmProposalParams): ConfirmProposal {
  const applyProposal = useApplyProposal()
  const [applying, setApplying] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [awaitingForm, setAwaitingForm] = useState(false)

  // ⚠️ **A trade that doesn't arrive must be said out loud.**
  //
  // When a token in the URL means nothing on the target chain, the app fills the
  // form with its default pair and keeps the amounts — so the form holds a trade
  // nobody asked for, wearing the person's numbers. The card correctly stays on
  // Confirm, but a button that didn't change is a quiet signal for a loud problem,
  // and the form beside it looks perfectly plausible.
  useEffect(() => {
    if (!awaitingForm) return undefined

    if (landed !== 'pending') {
      setAwaitingForm(false)
      return undefined
    }

    const timer = setTimeout(() => {
      setAwaitingForm(false)
      setProblem(
        "That didn't reach the form — what's showing there now is something else, not this trade. Don't sign it. It usually means one of these tokens doesn't exist on this network.",
      )
    }, LANDING_GRACE_MS)

    return () => clearTimeout(timer)
  }, [awaitingForm, landed])

  const confirm = useCallback(() => {
    if (!proposal || applying) return

    setProblem(null)
    setApplying(true)

    // Caught rather than left to reject: an unhandled rejection would leave the
    // button stuck reading "Switching network…" with no way back.
    applyProposal(proposal)
      .then((result) => {
        if (!result.ok) {
          setProblem(result.problem)
          return
        }

        markApplied()
        wrapWatch.watch(proposal)
        quoteWatch.arm()
        setAwaitingForm(true)
      })
      .catch((failure: unknown) => {
        console.error('[assistant] applying failed', failure)
        setProblem("Couldn't load that into the form.")
      })
      .finally(() => setApplying(false))
  }, [applyProposal, applying, markApplied, proposal, quoteWatch, wrapWatch])

  return { confirm, applying, problem }
}
