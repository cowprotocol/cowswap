import type { ReactNode } from 'react'

import type { Icon } from 'react-feather'

export type PrimitiveValue = string | number

export interface SelectInputOption<TValue extends PrimitiveValue = string> {
  label: string
  value: TValue
  disabled?: boolean
  icon?: Icon
}

export interface BaseSelectInputProps<TValue extends PrimitiveValue = string> {
  name: string
  label: string
  options: readonly SelectInputOption<TValue>[]
  disabled?: boolean
  emptyLabel?: string | boolean
  helperText?: ReactNode
}
