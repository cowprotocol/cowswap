import { Fragment, type ReactNode } from 'react'

import { isAddress } from '@cowprotocol/common-utils'

import Box from '@mui/material/Box'

import { NumberInput } from '../NumberInput/NumberInput.component'
import { TextInput } from '../TextInput/TextInput.component'

const TOKEN_SUGGESTIONS = ['COW', 'USDC', 'WBTC'] as const
const MAX_TOKEN_UNIT_LENGTH = 16

const tokenSuggestionButtonSx = {
  appearance: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  cursor: 'pointer',
  fontSize: '12px',
  color: 'text.secondary',
  textDecoration: 'underline',
  textDecorationStyle: 'dotted',
  textUnderlineOffset: 2,
  '&:hover': {
    textDecorationStyle: 'solid',
    color: 'text.primary',
  },
} as const

export interface CurrencyInputProps {
  label: string
  name: string
  tokenValue: string
  tokenAmountValue: number
  onChange: (name: string, value: string | number | null | undefined) => void
}

function getTokenAmountUnit(tokenValue: string): string | undefined {
  if (!tokenValue || isAddress(tokenValue)) {
    return undefined
  }

  if (tokenValue.length <= MAX_TOKEN_UNIT_LENGTH) {
    return tokenValue
  }

  return `${tokenValue.slice(0, MAX_TOKEN_UNIT_LENGTH)}...`
}

function renderTokenSuggestions(name: string, onChange: CurrencyInputProps['onChange']): ReactNode {
  return TOKEN_SUGGESTIONS.map((token, index) => (
    <Fragment key={token}>
      {index > 0 ? ', ' : null}
      <Box component="button" type="button" sx={tokenSuggestionButtonSx} onClick={() => onChange(name, token)}>
        {token}
      </Box>
    </Fragment>
  ))
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
  const amountUnit = getTokenAmountUnit(tokenValue)

  return (
    <>
      <TextInput
        name={name}
        label={label}
        value={tokenValue}
        onChange={onChange}
        helperText={renderTokenSuggestions(name, onChange)}
      />

      <NumberInput
        name={amountName}
        label={amountLabel}
        value={tokenAmountValue}
        onChange={onChange}
        unit={amountUnit}
        emptyValue={0}
        inputProps={{ min: 0, step: 'any' }}
      />
    </>
  )
}
