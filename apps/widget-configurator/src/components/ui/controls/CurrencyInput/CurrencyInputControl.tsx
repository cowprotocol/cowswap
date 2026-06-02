import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { NumberInput } from '../NumberInput/NumberInput.component'
import { SelectInput } from '../Select/SelectInput'

const TokenOptions = ['COW', 'USDC', 'WBTC']

export interface CurrencyInputProps {
  label: string
  tokenIdState: [string, Dispatch<SetStateAction<string>>]
  tokenAmountState: [number, Dispatch<SetStateAction<number>>]
}

export function CurrencyInputControl(props: CurrencyInputProps): ReactNode {
  const { tokenIdState, tokenAmountState, label } = props
  const [tokenId, setTokenId] = tokenIdState
  const [amount, setAmount] = tokenAmountState

  return (
    <>
      <SelectInput
        name={'selectTokenId' + label}
        label={label}
        value={TokenOptions.includes(tokenId) ? tokenId : ''}
        options={TokenOptions.map((option) => ({ label: option, value: option }))}
        onChange={(_, value) => {
          if (Array.isArray(value)) return
          setTokenId(value)
        }}
      />

      <NumberInput
        id={'selectTokenAmount' + label}
        name={'selectTokenAmount' + label}
        label={label}
        value={amount}
        onChange={(_, value) => setAmount(value ?? 0)}
        emptyValue={0}
        inputProps={{ min: 0, step: 'any' }}
      />
    </>
  )
}
