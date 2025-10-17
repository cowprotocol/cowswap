import { CustomTheme, getCustomThemePriority, isCustomThemeEnabled } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

import { cowSwapStore } from 'legacy/state'

import { injectedWidgetParamsAtom } from 'modules/injectedWidget/state/injectedWidgetParamsAtom'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

type SoundType = 'SEND' | 'SUCCESS' | 'ERROR'
type Sounds = Record<SoundType, string>
type WidgetSounds = keyof NonNullable<CowSwapWidgetAppParams['sounds']>

const DEFAULT_COW_SOUNDS: Sounds = {
  SEND: '/audio/send.mp3',
  SUCCESS: '/audio/success.mp3',
  ERROR: '/audio/error.mp3',
}

const WINTER_SOUNDS: Partial<Sounds> = {
  SEND: '/audio/send-winterTheme.mp3',
  SUCCESS: '/audio/success-winterTheme.mp3',
}

const HALLOWEEN_SOUNDS: Partial<Sounds> = {
  SEND: '/audio/halloween.mp3',
  SUCCESS: '/audio/halloween.mp3',
}

const COW_SOUND_TO_WIDGET_KEY: Record<SoundType, WidgetSounds> = {
  SEND: 'postOrder',
  SUCCESS: 'orderExecuted',
  ERROR: 'orderError',
}

const APRIL_FOOL_SOUND_SEND = [
  '/audio/cowswap-aprils2025-yoga.mp3',
  '/audio/cowswap-aprils2025-epic.mp3',
  '/audio/cowswap-aprils2025-bubba2.mp3',
  '/audio/cowswap-aprils2025-bubba.mp3',
]

function isDarkMode(): boolean {
  const state = cowSwapStore.getState()
  const { userDarkMode, matchesDarkMode } = state.user
  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

function pickRandomAprilsFoolSound(): string {
  // Check in the local storage for latest selections
  const lastSelections = localStorage.getItem('lastAprilFoolSoundSelections')
  const lastSelectionsArray: string[] = lastSelections ? JSON.parse(lastSelections) : []

  // Pick one from the remaining options
  const remainingOptions = APRIL_FOOL_SOUND_SEND.filter((sound) => !lastSelectionsArray.includes(sound))
  const randomPick = remainingOptions[Math.floor(Math.random() * remainingOptions.length)]

  // Add the latest selection and reset the selection if all sounds have been played
  lastSelectionsArray.push(randomPick)
  const newSelection = lastSelectionsArray.length === APRIL_FOOL_SOUND_SEND.length ? [] : lastSelectionsArray

  // Persist the selection
  localStorage.setItem('lastAprilFoolSoundSelections', JSON.stringify(newSelection))

  return randomPick
}

export function resolveSeasonalTheme(
  featureFlags: Record<string, boolean | number | undefined> | undefined,
  isDarkModeEnabled: boolean
): CustomTheme | undefined {
  for (const theme of getCustomThemePriority()) {
    if (!isCustomThemeEnabled(theme, featureFlags)) {
      continue
    }

    if (theme === CustomTheme.HALLOWEEN && !isDarkModeEnabled) {
      continue
    }

    return theme
  }

  return undefined
}

function getSeasonalSounds(featureFlags?: Record<string, boolean | number | undefined>): Partial<Sounds> {
  const activeSeasonalTheme = resolveSeasonalTheme(featureFlags, isDarkMode())

  if (activeSeasonalTheme === CustomTheme.HALLOWEEN) return HALLOWEEN_SOUNDS
  if (activeSeasonalTheme === CustomTheme.CHRISTMAS) return WINTER_SOUNDS

  return {}
}

function getThemeBasedSound(type: SoundType): string {
  const featureFlags = jotaiStore.get(featureFlagsAtom) as Record<string, boolean | number | undefined>
  const isAprilsFoolsEnabled = Boolean(featureFlags?.isAprilsFoolsEnabled)
  const isInjectedWidgetMode = isInjectedWidget()

  // When in widget mode, always return default sounds
  if (isInjectedWidgetMode) {
    return DEFAULT_COW_SOUNDS[type]
  }

  if (isAprilsFoolsEnabled && type === 'SEND') {
    return pickRandomAprilsFoolSound()
  }

  const themedSounds = getSeasonalSounds(featureFlags)
  return themedSounds[type] || DEFAULT_COW_SOUNDS[type]
}

const EMPTY_SOUND = new Audio('')
const SOUND_CACHE: Record<string, HTMLAudioElement | undefined> = {}

function getWidgetSoundUrl(type: SoundType): string | null | undefined {
  const { params } = jotaiStore.get(injectedWidgetParamsAtom)
  const key = COW_SOUND_TO_WIDGET_KEY[type]

  return params?.sounds?.[key]
}

function getAudio(type: SoundType): HTMLAudioElement {
  const widgetSound = getWidgetSoundUrl(type)
  const isWidgetMode = isInjectedWidget()

  if (isWidgetMode) {
    if (widgetSound === null) {
      return EMPTY_SOUND
    }
    // If in widget mode, use widget sound if provided, otherwise use default sound
    const soundPath = widgetSound || DEFAULT_COW_SOUNDS[type]
    let sound = SOUND_CACHE[soundPath]

    if (!sound) {
      sound = new Audio(soundPath)
      SOUND_CACHE[soundPath] = sound
    }

    return sound
  }

  // If not in widget mode, use theme-based sound
  const soundPath = getThemeBasedSound(type)
  let sound = SOUND_CACHE[soundPath]

  if (!sound) {
    sound = new Audio(soundPath)
    SOUND_CACHE[soundPath] = sound
  }

  return sound
}

export function getCowSoundSend(): HTMLAudioElement {
  return getAudio('SEND')
}

export function getCowSoundSuccess(): HTMLAudioElement {
  return getAudio('SUCCESS')
}

export function getCowSoundError(): HTMLAudioElement {
  return getAudio('ERROR')
}
