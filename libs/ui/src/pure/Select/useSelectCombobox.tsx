import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react'

import { useSelectComboboxEffects } from './useSelectCombobox.effects'
import { useSelectComboboxActions } from './useSelectComboboxActions'
import { useSelectComboboxKeyHandler } from './useSelectComboboxKeyHandler'
import { useSelectFilterAndOpen } from './useSelectFilterAndOpen'

import type { SelectProps } from './Select.types'

export interface UseSelectComboboxResult {
  buttonRef: RefObject<HTMLButtonElement | null>
  buttonId: string
  listboxId: string
  selectedLabel: string
  isOpen: boolean
  activeIndex: number
  filterQuery: string
  activeDescendantId: string | undefined
  handleButtonClick: () => void
  handleButtonKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void
  handleButtonBlur: (e: FocusEvent<HTMLButtonElement>) => void
  handleOptionClick: (e: MouseEvent<HTMLDivElement>) => void
  handleOptionMouseEnter: (index: number) => void
  closeDropdown: () => void
}

export function useSelectCombobox<T>({ value, options, onChange, disabled }: SelectProps<T>): UseSelectComboboxResult {
  const reactId = useId()
  const uid = reactId.replace(/:/g, '')
  const buttonId = `select-${uid}-trigger`
  const listboxId = `select-${uid}-listbox`
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isOpenRef = useRef(false)

  const {
    isOpen,
    activeIndex,
    setActiveIndex,
    filterQuery,
    setFilterQuery,
    scheduleFilterReset,
    closeDropdown,
    openDropdown,
    applyTypeahead,
    beginTypeaheadFromClosed,
  } = useSelectFilterAndOpen(value, options)

  useLayoutEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  const selectedOption = useMemo(() => options.find((o) => o.value === value), [options, value])
  const selectedLabel = selectedOption?.label ?? ''

  useSelectComboboxEffects({
    isOpen,
    optionsLength: options.length,
    activeIndex,
    listboxId,
    buttonRef,
    closeDropdown,
    setActiveIndex,
  })

  const { handleButtonClick, handleButtonBlur, handleOptionClick, handleOptionMouseEnter } = useSelectComboboxActions({
    disabled,
    isOpen,
    isOpenRef,
    listboxId,
    buttonRef,
    options,
    onChange,
    closeDropdown,
    openDropdown,
    setActiveIndex,
  })

  const handleButtonKeyDown = useSelectComboboxKeyHandler({
    disabled,
    isOpen,
    filterQuery,
    activeIndex,
    options,
    onChange,
    setActiveIndex,
    setFilterQuery,
    openDropdown,
    closeDropdown,
    applyTypeahead,
    beginTypeaheadFromClosed,
    scheduleFilterReset,
  })

  const activeDescendantId = isOpen && options.length > 0 ? `${listboxId}-option-${activeIndex}` : undefined

  return {
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
  }
}
