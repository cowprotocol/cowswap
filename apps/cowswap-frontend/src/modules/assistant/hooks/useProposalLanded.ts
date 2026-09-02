import { AssistantProposal, AssistantTokenRef, AssistantUiContext } from '../types'

/** What the form actually shows, compared against what was applied. */
export type LandedStatus = 'landed' | 'partial' | 'pending'

/**
 * Checks the form against the proposal, rather than trusting that applying worked.
 *
 * The card used to say "Loaded into the form" the instant `navigate()` was called,
 * which is a claim about the app's state made by something that only knows a
 * function was invoked. Twice that claim was false: once nothing loaded at all, and
 * once the tokens loaded without the amounts — both from a race in the app's URL
 * parameter handling. In each case the card said it had worked.
 *
 * So read it back. `uiContext` is derived from real trade state, so agreement
 * between it and the proposal is evidence; anything else is reported as it is.
 */
export function useProposalLanded(
  proposal: AssistantProposal | null,
  applied: boolean,
  uiContext: AssistantUiContext,
): LandedStatus {
  if (!proposal || !applied) return 'pending'

  const tokens =
    tokenMatches(uiContext.sellToken, proposal.sellToken) && tokenMatches(uiContext.buyToken, proposal.buyToken)

  // Only the sides the proposal actually named. A market order names one.
  const amounts =
    amountMatches(uiContext.sellTokenAmount, proposal.sellAmount) &&
    amountMatches(uiContext.buyTokenAmount, proposal.buyAmount)

  if (tokens && amounts) return 'landed'
  // Nothing landed at all — most likely the navigation itself didn't take.
  if (!tokens) return 'pending'
  return 'partial'
}

/**
 * Amounts are compared as numbers with a relative tolerance, not as strings.
 *
 * The form reformats what the URL carried — trailing zeros, decimal places, its own
 * rounding — so `'0.01'` and `'0.010'` describe the same trade and a string
 * comparison would report a failure that isn't one.
 */
function amountMatches(shown: string | null | undefined, proposed: string | undefined): boolean {
  if (!proposed) return true
  if (!shown) return false

  const a = Number(shown)
  const b = Number(proposed)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return false

  return Math.abs(a - b) / Math.abs(b) < 0.001
}

/** Address when there is one, symbol for native currency — the two id forms. */
function tokenMatches(shown: AssistantTokenRef | null | undefined, proposed: string): boolean {
  if (!shown) return false
  const target = proposed.toLowerCase()
  return shown.address?.toLowerCase() === target || shown.symbol?.toLowerCase() === target
}
