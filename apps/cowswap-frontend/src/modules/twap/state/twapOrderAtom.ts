import { atom } from 'jotai'

import { twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'

import { customDeadlineToSeconds } from '../utils/deadlinePartsDisplay'

export const twapDeadlineAtom = atom<number>((get) => {
  const { isCustomDeadline, customDeadline, deadline } = get(twapOrdersSettingsAtom)

  return isCustomDeadline ? customDeadlineToSeconds(customDeadline) : deadline / 1000
})

export const twapTimeIntervalAtom = atom<number>((get) => {
  const { numberOfPartsValue } = get(twapOrdersSettingsAtom)
  const seconds = get(twapDeadlineAtom)

  return Math.ceil(seconds / numberOfPartsValue)
})
