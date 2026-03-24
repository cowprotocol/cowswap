import { useEffect, useLayoutEffect, type Dispatch, type SetStateAction } from 'react'

export interface UseSelectComboboxEffectsParams {
  isOpen: boolean
  optionsLength: number
  activeIndex: number
  listboxId: string
  setActiveIndex: Dispatch<SetStateAction<number>>
}

export function useSelectComboboxEffects({
  isOpen,
  optionsLength,
  activeIndex,
  listboxId,
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
}
