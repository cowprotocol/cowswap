import { useEffect, useLayoutEffect, type Dispatch, type RefObject, type SetStateAction } from 'react'

export interface UseSelectComboboxEffectsParams {
  isOpen: boolean
  optionsLength: number
  activeIndex: number
  listboxId: string
  buttonRef: RefObject<HTMLButtonElement | null>
  closeDropdown: () => void
  setActiveIndex: Dispatch<SetStateAction<number>>
}

export function useSelectComboboxEffects({
  isOpen,
  optionsLength,
  activeIndex,
  listboxId,
  buttonRef,
  closeDropdown,
  setActiveIndex,
}: UseSelectComboboxEffectsParams): void {
  useEffect(() => {
    if (optionsLength === 0) return
    setActiveIndex((i) => Math.min(Math.max(0, i), optionsLength - 1))
  }, [optionsLength, setActiveIndex])

  useLayoutEffect(() => {
    if (!isOpen || optionsLength === 0) return
    document.getElementById(`${listboxId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, activeIndex, listboxId, optionsLength])

  useEffect(() => {
    if (!isOpen) return
    const onPointerDownCapture = (e: PointerEvent): void => {
      const target = e.target as Node
      if (buttonRef.current?.contains(target)) return
      const list = document.getElementById(listboxId)
      if (list?.contains(target)) return
      closeDropdown()
    }
    document.addEventListener('pointerdown', onPointerDownCapture, true)
    return () => document.removeEventListener('pointerdown', onPointerDownCapture, true)
  }, [isOpen, listboxId, closeDropdown, buttonRef])
}
