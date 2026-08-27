import { useCallback, useState } from 'react'

import { useApplyProposal } from './useApplyProposal'
import { QuoteWatchState } from './useQuoteWatch'
import { WrapWatch } from './useWrapWatch'

import { AssistantProposal } from '../types'

export interface ConfirmProposal {
  confirm(): void
  /** In flight — usually waiting on a wallet network switch. */
  applying: boolean
  problem: string | null
}

interface ConfirmProposalParams {
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
  markApplied,
  proposal,
  quoteWatch,
  wrapWatch,
}: ConfirmProposalParams): ConfirmProposal {
  const applyProposal = useApplyProposal()
  const [applying, setApplying] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

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
      })
      .catch((failure: unknown) => {
        console.error('[assistant] applying failed', failure)
        setProblem("Couldn't load that into the form.")
      })
      .finally(() => setApplying(false))
  }, [applyProposal, applying, markApplied, proposal, quoteWatch, wrapWatch])

  return { confirm, applying, problem }
}
