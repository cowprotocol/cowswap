export type SelectVariant = 'text' | 'border' | 'solid'

export type SelectHeight = 32 | 40 | 48

export interface FormOption<T> {
  label: string
  value: T
  // TODO: Add logo/image and description
}

export interface SelectProps<T> {
  variant: SelectVariant
  height?: SelectHeight
  name: string
  /** Used for aria-label on the combobox when `name` is not human-readable */
  ariaLabel?: string
  value: T
  options: FormOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
}
