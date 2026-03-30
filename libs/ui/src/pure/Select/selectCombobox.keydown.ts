import type { Dispatch, KeyboardEvent as ReactKeyboardEvent, SetStateAction } from 'react'

import { isPrintableTypeaheadKey, labelMatchesFilter } from './selectCombobox.utils'

import type { FormOption } from './Select.types'

export interface SelectComboboxKeydownPayload<T> {
  disabled: boolean
  isOpen: boolean
  filterQuery: string
  activeIndex: number
  options: FormOption<T>[]
  onChange: (v: T) => void
  setActiveIndex: Dispatch<SetStateAction<number>>
  setFilterQuery: Dispatch<SetStateAction<string>>
  openDropdown: () => void
  closeDropdown: () => void
  applyTypeahead: (char: string) => void
  beginTypeaheadFromClosed: (char: string) => void
  scheduleFilterReset: () => void
}

function tryHandleEscape(
  e: KeyboardEvent | ReactKeyboardEvent<HTMLButtonElement>,
  isOpen: boolean,
  closeDropdown: () => void,
): boolean {
  if (e.key !== 'Escape' || !isOpen) return false
  e.preventDefault()
  closeDropdown()
  return true
}

function tryHandleArrowDown<T>(
  e: KeyboardEvent | ReactKeyboardEvent<HTMLButtonElement>,
  p: SelectComboboxKeydownPayload<T>,
  optionCount: number,
): boolean {
  if (e.key !== 'ArrowDown') return false
  e.preventDefault()
  if (!p.isOpen) {
    p.openDropdown()
  } else {
    p.setActiveIndex((i) => (i + 1) % optionCount)
  }
  return true
}

function tryHandleArrowUp<T>(
  e: KeyboardEvent | ReactKeyboardEvent<HTMLButtonElement>,
  p: SelectComboboxKeydownPayload<T>,
  optionCount: number,
): boolean {
  if (e.key !== 'ArrowUp') return false
  e.preventDefault()
  if (!p.isOpen) {
    p.openDropdown()
  } else {
    p.setActiveIndex((i) => (i - 1 + optionCount) % optionCount)
  }
  return true
}

function tryHandleHomeEnd<T>(
  e: KeyboardEvent | ReactKeyboardEvent<HTMLButtonElement>,
  p: SelectComboboxKeydownPayload<T>,
  optionCount: number,
): boolean {
  if (!p.isOpen) return false
  if (e.key === 'Home') {
    e.preventDefault()
    p.setActiveIndex(0)
    return true
  }
  if (e.key === 'End') {
    e.preventDefault()
    p.setActiveIndex(optionCount - 1)
    return true
  }
  return false
}

function tryHandleEnterSpace<T>(
  e: KeyboardEvent | ReactKeyboardEvent<HTMLButtonElement>,
  p: SelectComboboxKeydownPayload<T>,
): boolean {
  if (e.key !== 'Enter' && e.key !== ' ') return false
  if (!p.isOpen) {
    e.preventDefault()
    p.openDropdown()
    return true
  }
  e.preventDefault()
  const opt = p.options[p.activeIndex]
  if (opt) {
    p.onChange(opt.value)
    p.closeDropdown()
  }
  return true
}

function tryHandleBackspace<T>(
  e: KeyboardEvent | ReactKeyboardEvent<HTMLButtonElement>,
  p: SelectComboboxKeydownPayload<T>,
): boolean {
  if (!p.isOpen || e.key !== 'Backspace' || p.filterQuery.length === 0) return false
  e.preventDefault()
  const nextQuery = p.filterQuery.slice(0, -1)
  p.setFilterQuery(nextQuery)
  if (nextQuery.length > 0) {
    const first = p.options.findIndex((o) => labelMatchesFilter(o.label, nextQuery))
    if (first >= 0) p.setActiveIndex(first)
  }
  p.scheduleFilterReset()
  return true
}

function tryHandlePrintable<T>(
  e: KeyboardEvent | ReactKeyboardEvent<HTMLButtonElement>,
  p: SelectComboboxKeydownPayload<T>,
): boolean {
  if (!isPrintableTypeaheadKey(e)) return false
  e.preventDefault()
  if (!p.isOpen) {
    p.beginTypeaheadFromClosed(e.key)
  } else {
    p.applyTypeahead(e.key)
  }
  return true
}

export function handleSelectComboboxKeyDown<T>(
  e: KeyboardEvent | ReactKeyboardEvent<HTMLButtonElement>,
  p: SelectComboboxKeydownPayload<T>,
): void {
  // TODO: Verify the focus is still within the dropdown?

  if (p.disabled) return
  const n = p.options.length
  if (n === 0) return
  if (tryHandleEscape(e, p.isOpen, p.closeDropdown)) return
  if (tryHandleArrowDown(e, p, n)) return
  if (tryHandleArrowUp(e, p, n)) return
  if (tryHandleHomeEnd(e, p, n)) return
  if (tryHandleEnterSpace(e, p)) return
  if (tryHandleBackspace(e, p)) return
  tryHandlePrintable(e, p)
}
