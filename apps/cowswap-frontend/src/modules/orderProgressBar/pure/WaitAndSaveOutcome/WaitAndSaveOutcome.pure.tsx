import { ReactNode } from 'react'

import { OutcomeWithCow, OutcomeWithCowProps } from './components/OutcomeWithCow/OutcomeWithCow.pure'
import {
  OutcomeWithWaivedFee,
  OutcomeWithWaivedFeeProps,
} from './components/OutcomeWithWaivedFee/OutcomeWithWaivedFee.pure'
import {
  OutcomeWithWaivedFeeAndCow,
  OutcomeWithWaivedFeeAndCowProps,
} from './components/OutcomeWithWaivedFeeAndCow/OutcomeWithWaivedFeeAndCow.pure'

export type OutcomeWithCowOutcomeProps = OutcomeWithCowProps & {
  variant: 'withCow'
}

export type OutcomeWithWaivedFeeAndCowOutcomeProps = OutcomeWithWaivedFeeAndCowProps & {
  variant: 'withWaivedFeeAndCow'
}

export type OutcomeWithWaivedFeeOutcomeProps = OutcomeWithWaivedFeeProps & {
  variant: 'withWaivedFee'
}

export type WaitAndSaveOutcomeProps =
  | OutcomeWithWaivedFeeAndCowOutcomeProps
  | OutcomeWithWaivedFeeOutcomeProps
  | OutcomeWithCowOutcomeProps

export function WaitAndSaveOutcome(props: WaitAndSaveOutcomeProps): ReactNode {
  if (props.variant === 'withWaivedFee') {
    return <OutcomeWithWaivedFee {...props} />
  }

  if (props.variant === 'withWaivedFeeAndCow') {
    return <OutcomeWithWaivedFeeAndCow {...props} />
  }

  return <OutcomeWithCow {...props} />
}
