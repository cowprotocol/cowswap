import { ReactNode, useEffect } from 'react'

import { ChevronDown } from 'react-feather'

import * as styledEl from './Select.styled'
import { labelMatchesFilter, preventAnchorBlur } from './selectCombobox.utils'
import { useSelectCombobox } from './useSelectCombobox'

import { Dropdown } from '../Dropdown/Dropdown.pure'

import type { FormOption, SelectHeight, SelectProps, SelectVariant } from './Select.types'

// TODO: Duplicated, extract.
const NBSP = '\u00A0'

export type { FormOption, SelectHeight, SelectProps, SelectVariant }

// eslint-disable-next-line max-lines-per-function
export function Select<T>({
  variant,
  height,
  title,
  tooltip,
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
    handleKeyDown,
    handleButtonBlur,
    handleOptionClick,
    handleOptionMouseEnter,
    closeDropdown,
  } = useSelectCombobox({
    variant,
    height,
    title,
    tooltip,
    name,
    ariaLabel,
    value,
    options,
    onChange,
    disabled,
  })

  useEffect(() => {
    if (!isOpen) return

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

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
        aria-label={ariaLabel}
        aria-autocomplete="list"
        role="combobox"
        onClick={handleButtonClick}
        onBlur={handleButtonBlur}
      >
        <styledEl.ButtonLabel>{selectedLabel}</styledEl.ButtonLabel>
        <styledEl.ChevronIconWrapper $isOpen={isOpen} aria-hidden>
          <ChevronDown size={20} />
        </styledEl.ChevronIconWrapper>
      </styledEl.SelectButton>

      <Dropdown isOpen={isOpen} onDismiss={closeDropdown} anchorRef={buttonRef}>
        <styledEl.DropdownHeader>
          <styledEl.DropdownTitle>{title} </styledEl.DropdownTitle>
          {tooltip ? (
            <>
              {NBSP}
              <styledEl.DropdownHelpTooltip text={tooltip} noMargin dimmed />
            </>
          ) : null}
        </styledEl.DropdownHeader>
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
