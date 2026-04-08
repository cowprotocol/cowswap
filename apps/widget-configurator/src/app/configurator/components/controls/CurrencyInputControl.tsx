import { ChangeEvent, Dispatch, SetStateAction } from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

const TokenOptions = ['COW', 'USDC', 'WBTC']

export interface CurrencyInputProps {
  label: string
  tokenIdState: [string, Dispatch<SetStateAction<string>>]
  tokenAmountState: [number, Dispatch<SetStateAction<number>>]
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CurrencyInputControl(props: CurrencyInputProps) {
  const { tokenIdState, tokenAmountState, label } = props
  const [tokenId, setTokenId] = tokenIdState
  const [amount, setAmount] = tokenAmountState

  return (
    <>
      <Autocomplete
        value={tokenId}
        onChange={(event: ChangeEvent<unknown>, newValue: string | null) => {
          setTokenId(newValue || '')
        }}
        inputValue={tokenId || ''}
        onInputChange={(event: ChangeEvent<unknown>, newInputValue: string) => {
          setTokenId(newInputValue || '')
        }}
        id={'selectTokenId' + label}
        options={TokenOptions}
        size="small"
        renderInput={(params) => <TextField {...params} label={label} />}
      />

      <TextField
        id={'selectTokenAmount' + label}
        label={label}
        value={amount}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(Number(e.target.value || 0))}
        size="small"
      />
    </>
  )
}
