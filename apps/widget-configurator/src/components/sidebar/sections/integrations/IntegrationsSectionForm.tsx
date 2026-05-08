import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { PartnerFeeControl } from '../../../controls/PartnerFeeControl'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

interface IntegrationsSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

export function IntegrationsSectionForm({ values, onChange }: IntegrationsSectionFormProps): ReactNode {
  const partnerFeeBpsState: [number, Dispatch<SetStateAction<number>>] = [
    values.partnerFeeBps,
    (nextValue) => {
      const resolvedValue = typeof nextValue === 'function' ? nextValue(values.partnerFeeBps) : nextValue
      onChange('partnerFeeBps', resolvedValue)
    },
  ]

  return <PartnerFeeControl feeBpsState={partnerFeeBpsState} />
}
