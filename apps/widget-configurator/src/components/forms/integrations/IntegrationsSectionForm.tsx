import type { ReactNode } from 'react'

import Box from '@mui/material/Box'

import { getSolanaFeeNotice } from '../../../configurator.utils'
import { NumberInput } from '../../ui/inputs/NumberInput/NumberInput.component'

import type { SidebarSectionFormProps } from '../forms.types'

export function IntegrationsSectionForm({ values, onChange }: SidebarSectionFormProps): ReactNode {
  const solanaFeeNotice = getSolanaFeeNotice(values)

  return (
    <NumberInput
      id="partnerFeePercent"
      name="partnerFeeBps"
      label="Partner fee"
      value={values.partnerFeeBps}
      onChange={onChange}
      unit="BPS"
      helperText={
        <>
          {formatBpsAsPercent(values.partnerFeeBps)}
          {solanaFeeNotice ? (
            <Box component="span" sx={{ display: 'block', mt: '0.4rem' }}>
              {solanaFeeNotice}
            </Box>
          ) : null}
        </>
      }
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

function formatBpsAsPercent(bps: number): string {
  const percent = bps / 100

  if (bps === 0) {
    return '0%'
  }

  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(percent)

  return `${formatted}%`
}
