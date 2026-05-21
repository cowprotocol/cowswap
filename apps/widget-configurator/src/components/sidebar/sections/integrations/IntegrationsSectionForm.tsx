import type { ReactNode } from 'react'

import { NumberInput } from '../../../ui/controls/NumberInput/NumberInput.component'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

interface IntegrationsSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

export function IntegrationsSectionForm({ values, onChange }: IntegrationsSectionFormProps): ReactNode {
  return (
    <NumberInput
      id="partnerFeePercent"
      name="partnerFeeBps"
      label="Partner fee BPS"
      value={values.partnerFeeBps}
      onChange={onChange}
      emptyValue={0}
      parseValue={(rawValue) => {
        const roundedValue = Math.ceil(Number(rawValue))
        const boundedValue = Math.min(Math.max(roundedValue, 0), 100)
        return Number.isNaN(boundedValue) ? 0 : boundedValue
      }}
      inputProps={{
        min: 0,
        max: 100,
        step: 1,
      }}
    />
  )
}
