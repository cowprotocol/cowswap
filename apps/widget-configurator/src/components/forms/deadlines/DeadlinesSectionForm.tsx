import type { ReactNode } from 'react'

import {
  DEFAULT_ADVANCED_DEADLINE_MINUTES,
  DEFAULT_LIMIT_DEADLINE_MINUTES,
  DEFAULT_SWAP_DEADLINE_MINUTES,
} from '../../../configurator.constants'
import { NumberInput } from '../../ui/inputs/NumberInput/NumberInput.component'

import type { SidebarSectionFormProps } from '../forms.types'

function parseDeadlineValue(rawValue: string): number | undefined {
  const numericValue = Number(rawValue)
  if (Number.isNaN(numericValue)) return undefined

  return Math.max(1, numericValue)
}

export function DeadlinesSectionForm({ values, onChange }: SidebarSectionFormProps): ReactNode {
  return (
    <>
      <NumberInput
        name="swapDeadline"
        label="Swap Deadline"
        value={values.swapDeadline}
        onChange={onChange}
        unit="min"
        emptyValue={DEFAULT_SWAP_DEADLINE_MINUTES}
        parseValue={parseDeadlineValue}
        inputProps={{ min: 1, step: 1 }}
      />
      <NumberInput
        name="limitDeadline"
        label="Limit Deadline"
        value={values.limitDeadline}
        onChange={onChange}
        unit="min"
        emptyValue={DEFAULT_LIMIT_DEADLINE_MINUTES}
        parseValue={parseDeadlineValue}
        inputProps={{ min: 1, step: 1 }}
      />
      <NumberInput
        name="advancedDeadline"
        label="Advanced Deadline"
        value={values.advancedDeadline}
        onChange={onChange}
        unit="min"
        emptyValue={DEFAULT_ADVANCED_DEADLINE_MINUTES}
        parseValue={parseDeadlineValue}
        inputProps={{ min: 1, step: 1 }}
      />
    </>
  )
}
