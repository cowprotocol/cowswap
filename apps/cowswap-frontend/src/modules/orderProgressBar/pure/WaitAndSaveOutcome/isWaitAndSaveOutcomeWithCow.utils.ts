import type {
  OutcomeWithCowOutcomeProps,
  OutcomeWithWaivedFeeAndCowOutcomeProps,
  WaitAndSaveOutcomeProps,
} from './WaitAndSaveOutcome.pure'

export function isWaitAndSaveOutcomeWithCow(
  outcome: WaitAndSaveOutcomeProps,
): outcome is OutcomeWithWaivedFeeAndCowOutcomeProps | OutcomeWithCowOutcomeProps {
  return outcome.variant === 'withCow' || outcome.variant === 'withWaivedFeeAndCow'
}
