import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export interface UiGuideState {
  skipped: boolean
  finished?: boolean
  currentStep?: number
}
export const uiGuideState = atomWithStorage<UiGuideState>('uiGuide:v1', {
  skipped: false,
})

export const uiGuideQuotePausedState = atom(false)
