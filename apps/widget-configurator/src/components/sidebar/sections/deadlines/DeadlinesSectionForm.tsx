import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { DeadlineControl } from '../../../controls/DeadlineControl'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

function resolveNextState<T>(current: T, next: SetStateAction<T>): T {
  return typeof next === 'function' ? (next as (prevState: T) => T)(current) : next
}

interface DeadlinesSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

export function DeadlinesSectionForm({ values, onChange }: DeadlinesSectionFormProps): ReactNode {
  const deadlineState: [number | undefined, Dispatch<SetStateAction<number | undefined>>] = [
    values.deadline,
    (nextValue) => onChange('deadline', resolveNextState(values.deadline, nextValue)),
  ]
  const swapDeadlineState: [number | undefined, Dispatch<SetStateAction<number | undefined>>] = [
    values.swapDeadline,
    (nextValue) => onChange('swapDeadline', resolveNextState(values.swapDeadline, nextValue)),
  ]
  const limitDeadlineState: [number | undefined, Dispatch<SetStateAction<number | undefined>>] = [
    values.limitDeadline,
    (nextValue) => onChange('limitDeadline', resolveNextState(values.limitDeadline, nextValue)),
  ]
  const advancedDeadlineState: [number | undefined, Dispatch<SetStateAction<number | undefined>>] = [
    values.advancedDeadline,
    (nextValue) => onChange('advancedDeadline', resolveNextState(values.advancedDeadline, nextValue)),
  ]

  return (
    <>
      <DeadlineControl label="Global Deadline" deadlineState={deadlineState} />
      <DeadlineControl label="Swap Deadline" deadlineState={swapDeadlineState} />
      <DeadlineControl label="Limit Deadline" deadlineState={limitDeadlineState} />
      <DeadlineControl label="Advanced Deadline" deadlineState={advancedDeadlineState} />
    </>
  )
}
