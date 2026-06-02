import type { ReactNode } from 'react'

import { NumberInput } from '../NumberInput/NumberInput.component'
import { SelectInput } from '../Select/single/SelectInput.component'

import type { SelectInputOption } from '../Select/base/BaseSelectInput.types'

const TOKEN_OPTIONS: SelectInputOption<string>[] = [
  { label: 'COW', value: 'COW' },
  { label: 'USDC', value: 'USDC' },
  { label: 'WBTC', value: 'WBTC' },
]

export interface CurrencyInputProps {
  label: string
  name: string
  tokenValue: string
  tokenAmountValue: number
  onChange: (name: string, value: string | number | null | undefined) => void
}

export function CurrencyInputControl({
  label,
  name,
  tokenValue,
  tokenAmountValue,
  onChange,
}: CurrencyInputProps): ReactNode {
  const amountName = `${name}Amount`
  const amountLabel = `${label} amount`

  return (
    <>
      <SelectInput name={name} label={label} value={tokenValue} options={TOKEN_OPTIONS} onChange={onChange} />

      <NumberInput
        name={amountName}
        label={amountLabel}
        value={tokenAmountValue}
        onChange={onChange}
        emptyValue={0}
        inputProps={{ min: 0, step: 'any' }}
      />
    </>
  )
}
