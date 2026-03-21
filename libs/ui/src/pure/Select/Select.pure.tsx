import { ReactNode } from 'react'

import { ChevronDown } from 'react-feather'

import * as styledEl from './Select.styled'
import { labelMatchesFilter, preventAnchorBlur } from './selectCombobox.utils'
import { useSelectCombobox } from './useSelectCombobox'

import { Dropdown } from '../Dropdown/Dropdown.pure'

import type { FormOption, SelectHeight, SelectProps, SelectVariant } from './Select.types'

export type { FormOption, SelectHeight, SelectProps, SelectVariant }

export function Select<T>({
  variant,
  height,
  name,
  ariaLabel,
  value,
  options,
  onChange,
  disabled,
}: SelectProps<T>): ReactNode {
  const {
    buttonRef,
    buttonId,
    listboxId,
    selectedLabel,
    isOpen,
    activeIndex,
    filterQuery,
    activeDescendantId,
    handleButtonClick,
    handleButtonKeyDown,
    handleButtonBlur,
    handleOptionClick,
    handleOptionMouseEnter,
    closeDropdown,
  } = useSelectCombobox({ variant, height, name, ariaLabel, value, options, onChange, disabled })

  return (
    <styledEl.Wrapper>
      <styledEl.SelectButton
        ref={buttonRef}
        type="button"
        id={buttonId}
        name={name}
        $variant={variant}
        $height={height}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendantId}
        {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
        aria-autocomplete="list"
        role="combobox"
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
        onBlur={handleButtonBlur}
      >
        <styledEl.ButtonLabel>{selectedLabel}</styledEl.ButtonLabel>
        <styledEl.ChevronIconWrapper $isOpen={isOpen} aria-hidden>
          <ChevronDown size={20} />
        </styledEl.ChevronIconWrapper>
      </styledEl.SelectButton>

      <Dropdown isOpen={isOpen} onDismiss={closeDropdown} anchorRef={buttonRef}>
        <styledEl.DropdownContent
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          onMouseDown={preventAnchorBlur}
        >
          {options.map((option, index) => {
            const isDimmed = filterQuery.length > 0 && !labelMatchesFilter(option.label, filterQuery)
            const isActive = index === activeIndex
            return (
              <styledEl.DropdownItem
                key={`${option.value}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                data-option-index={index}
                $isActive={isActive}
                $isDimmed={isDimmed}
                onClick={handleOptionClick}
                onMouseEnter={() => handleOptionMouseEnter(index)}
              >
                {option.label}
              </styledEl.DropdownItem>
            )
          })}
        </styledEl.DropdownContent>
      </Dropdown>
    </styledEl.Wrapper>
  )
}
