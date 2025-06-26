import { ReactNode } from 'react'

import { FormControl, TextField } from '@mui/material'

interface SlippageState {
  min?: number
  max?: number
  defaultValue?: number
}

export interface SlippageConfigControlProps extends SlippageState {
  label: string
  minChainSlippage: number
  maxChainSlippage: number
  onSlippageChange: (fieldName: keyof SlippageState, value?: number) => void
}

export function SlippageConfigControl(props: SlippageConfigControlProps): ReactNode {
  const {
    min,
    max,
    defaultValue,
    onSlippageChange,
    minChainSlippage,
    maxChainSlippage,
  } = props

  return (
    <>
      <FormControl>
        <TextField
          type="number"
          label="min"
          value={min}
          onChange={({ target: { value } }) => {
            const newVal = value && !isNaN(+value) ? +value : undefined
            onSlippageChange('min', newVal)
          }}
          size="small"
          inputProps={{ min: minChainSlippage }}
        />
      </FormControl>
      <FormControl>
        <TextField
          type="number"
          label="max"
          value={max}
          onChange={({ target: { value } }) => {
            const newVal = value && !isNaN(+value) ? +value : undefined
            onSlippageChange('max', newVal)
          }}
          size="small"
          inputProps={{ min: minChainSlippage, max: maxChainSlippage }}
        />
      </FormControl>
      <FormControl>
        <TextField
          type="number"
          label="default"
          value={defaultValue}
          onChange={({ target: { value } }) => {
            const newVal = value && !isNaN(+value) ? +value : undefined
            onSlippageChange('min', newVal)
          }}
          size="small"
          inputProps={{ min: minChainSlippage, max: maxChainSlippage }}
        />
      </FormControl>
    </>
  )
}
