import { TradeFormFieldProps } from '@cow/common/pure/TradeForm/TradeFormField'
import { InputHTMLAttributes } from 'react'

export interface TradeFormInputProps
  extends TradeFormFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'ref' | 'onChange' | 'as'> {
  label: string
  fontSize?: 'big' | 'medium'
  placeholder?: string
  children?: JSX.Element
  value: string
  onChange: (input: string) => void
}
