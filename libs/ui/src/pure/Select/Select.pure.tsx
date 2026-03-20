import { useState, useCallback, useRef, useEffect, ReactNode } from 'react'

import { ChevronDown } from 'react-feather'

import * as styledEl from './Select.styled'

import { Dropdown } from '../Dropdown/Dropdown.pure'
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
  value: T
  options: FormOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
}

export function Select<T>({ variant, height, name, value, options, onChange, disabled }: SelectProps<T>): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null)

  const [inputValue, setInputValue] = useState(`${value}`)

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const handleToggleOpen = useCallback(() => {
    console.log('handleToggleOpen', isOpen)
    if (!isOpen) setIsOpen(true)
  }, [isOpen])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleOptionSelected = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const value = e.currentTarget.dataset.value

      // TODO: Validate value is in options
      if (value) onChange(value as T)
    },
    [onChange],
  )

  const handleFocus = useCallback(() => {
    console.log('handleFocus')
    setInputValue(`${value}`)
    setIsOpen(true)
  }, [value])

  const handleBlur = useCallback(() => {
    console.log('handleBlur')
    setInputValue(`${value}`)
    setIsOpen(false)
  }, [value])

  return (
    <styledEl.Wrapper>
      <styledEl.SelectInput
        ref={inputRef}
        name={name}
        $variant={variant}
        $height={height}
        value={`${inputValue}`}
        placeholder={`${value}`}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
      />

      <styledEl.ChevronIconWrapper $isOpen={isOpen} onClick={handleToggleOpen}>
        <ChevronDown size={20} />
      </styledEl.ChevronIconWrapper>

      <Dropdown isOpen={isOpen} onDismiss={() => setIsOpen(false)} anchorRef={inputRef}>
        <styledEl.DropdownContent>
          {options.map((option) => (
            <styledEl.DropdownItem key={`${option.value}`} onClick={handleOptionSelected} data-value={option.value}>
              {option.label}
            </styledEl.DropdownItem>
          ))}
        </styledEl.DropdownContent>
      </Dropdown>
    </styledEl.Wrapper>
  )
}
