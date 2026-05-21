import type { ReactNode } from 'react'

import { NumberInput } from '../../../ui/controls/NumberInput/NumberInput.component'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

interface DeadlinesSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

function parseDeadlineValue(rawValue: string): number | undefined {
  const numericValue = Number(rawValue)
  if (Number.isNaN(numericValue)) return undefined

  return Math.max(1, numericValue)
}

export function DeadlinesSectionForm({ values, onChange }: DeadlinesSectionFormProps): ReactNode {
  return (
    <>
      <NumberInput
        name="deadline"
        label="Global Deadline"
        value={values.deadline}
        onChange={onChange}
        emptyValue={undefined}
        parseValue={parseDeadlineValue}
        inputProps={{ min: 1, step: 1 }}
      />
      <NumberInput
        name="swapDeadline"
        label="Swap Deadline"
        value={values.swapDeadline}
        onChange={onChange}
        emptyValue={undefined}
        parseValue={parseDeadlineValue}
        inputProps={{ min: 1, step: 1 }}
      />
      <NumberInput
        name="limitDeadline"
        label="Limit Deadline"
        value={values.limitDeadline}
        onChange={onChange}
        emptyValue={undefined}
        parseValue={parseDeadlineValue}
        inputProps={{ min: 1, step: 1 }}
      />
      <NumberInput
        name="advancedDeadline"
        label="Advanced Deadline"
        value={values.advancedDeadline}
        onChange={onChange}
        emptyValue={undefined}
        parseValue={parseDeadlineValue}
        inputProps={{ min: 1, step: 1 }}
      />
    </>
  )
}
