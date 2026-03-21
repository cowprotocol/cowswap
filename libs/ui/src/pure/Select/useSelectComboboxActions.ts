import {
  useCallback,
  type Dispatch,
  type FocusEvent,
  type MouseEvent,
  type RefObject,
  type SetStateAction,
} from 'react'

import type { FormOption } from './Select.types'

export interface UseSelectComboboxActionsParams<T> {
  disabled: boolean | undefined
  isOpen: boolean
  isOpenRef: RefObject<boolean>
  listboxId: string
  buttonRef: RefObject<HTMLButtonElement | null>
  options: FormOption<T>[]
  onChange: (value: T) => void
  closeDropdown: () => void
  openDropdown: () => void
  setActiveIndex: Dispatch<SetStateAction<number>>
}

export interface UseSelectComboboxActionsResult {
  handleButtonClick: () => void
  handleButtonBlur: (e: FocusEvent<HTMLButtonElement>) => void
  handleOptionClick: (e: MouseEvent<HTMLDivElement>) => void
  handleOptionMouseEnter: (index: number) => void
}

export function useSelectComboboxActions<T>({
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
}: UseSelectComboboxActionsParams<T>): UseSelectComboboxActionsResult {
  const handleButtonClick = useCallback(() => {
    if (disabled) return
    if (isOpen) {
      closeDropdown()
    } else {
      openDropdown()
    }
  }, [disabled, isOpen, closeDropdown, openDropdown])

  const handleButtonBlur = useCallback(
    (e: FocusEvent<HTMLButtonElement>) => {
      const button = e.currentTarget
      const next = e.relatedTarget
      if (next instanceof Node && button.contains(next)) return

      const list = document.getElementById(listboxId)
      if (next instanceof Node && list?.contains(next)) return

      const listboxIdSnapshot = listboxId
      window.setTimeout(() => {
        if (!isOpenRef.current) return

        const listEl = document.getElementById(listboxIdSnapshot)
        const active = document.activeElement
        if (!(active instanceof Node)) {
          closeDropdown()
          return
        }

        const trigger = buttonRef.current
        if (trigger?.contains(active)) return
        if (listEl?.contains(active)) return

        const dialogScope = listEl?.closest('[data-reach-dialog-content]')
        if (dialogScope?.contains(active)) return

        closeDropdown()
      }, 0)
    },
    [closeDropdown, listboxId, buttonRef, isOpenRef],
  )

  const handleOptionClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const idxStr = e.currentTarget.dataset.optionIndex
      const idx = idxStr === undefined ? NaN : Number.parseInt(idxStr, 10)
      const option = Number.isFinite(idx) ? options[idx] : undefined
      if (!option) return
      onChange(option.value)
      closeDropdown()
    },
    [onChange, options, closeDropdown],
  )

  const handleOptionMouseEnter = useCallback(
    (index: number) => {
      setActiveIndex(index)
    },
    [setActiveIndex],
  )

  return {
    handleButtonClick,
    handleButtonBlur,
    handleOptionClick,
    handleOptionMouseEnter,
  }
}
