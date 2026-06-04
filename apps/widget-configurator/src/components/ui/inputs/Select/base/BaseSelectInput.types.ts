import type { ComponentType, ReactNode } from 'react'

export type PrimitiveValue = string | number

export interface SelectInputOption<TValue extends PrimitiveValue = string> {
  label: string
  value: TValue
  disabled?: boolean
  icon?: ComponentType
}

export interface BaseSelectInputProps<TValue extends PrimitiveValue = string> {
  name: string
  label: string
  options: readonly SelectInputOption<TValue>[]
  disabled?: boolean
  emptyLabel?: string | boolean
  helperText?: ReactNode
}
