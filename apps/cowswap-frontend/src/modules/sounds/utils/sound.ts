import { ACTIVE_CUSTOM_THEME, CustomTheme } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

import { cowSwapStore } from 'legacy/state'

import { injectedWidgetParamsAtom } from 'modules/injectedWidget/state/injectedWidgetParamsAtom'

type SoundType = 'SEND' | 'SUCCESS' | 'ERROR'
type Sounds = Record<SoundType, string>
type WidgetSounds = keyof NonNullable<CowSwapWidgetAppParams['sounds']>
type ThemedSoundOptions = {
  winterSound?: string
  halloweenSound?: string
}

const DEFAULT_COW_SOUNDS: Sounds = {
  SEND: '/audio/send.mp3',
  SUCCESS: '/audio/success.mp3',
  ERROR: '/audio/error.mp3',
}

const THEMED_SOUNDS: Partial<Record<SoundType, ThemedSoundOptions>> = {
  SEND: {
    winterSound: '/audio/send-winterTheme.mp3',
    halloweenSound: '/audio/halloween.mp3',
  },
  SUCCESS: {
    winterSound: '/audio/success-winterTheme.mp3',
    halloweenSound: '/audio/halloween.mp3',
  },
}

const COW_SOUND_TO_WIDGET_KEY: Record<SoundType, WidgetSounds> = {
  SEND: 'postOrder',
  SUCCESS: 'orderExecuted',
  ERROR: 'orderError',
}

function isDarkMode(): boolean {
  const state = cowSwapStore.getState()
  const { userDarkMode, matchesDarkMode } = state.user
  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

function getThemeBasedSound(type: SoundType): string {
  // TODO: load featureFlags when enabling again
  // const featureFlags = jotaiStore.get(featureFlagsAtom) as Record<string, boolean>
  // const { isChristmasEnabled, isHalloweenEnabled } = featureFlags
  const isChristmasEnabled = false
  const isHalloweenEnabled = false

  const defaultSound = DEFAULT_COW_SOUNDS[type]
  const themedOptions = THEMED_SOUNDS[type]

  const isInjectedWidgetMode = isInjectedWidget()

  // When in widget mode, always return default sounds
  if (isInjectedWidgetMode) {
    return DEFAULT_COW_SOUNDS[type]
  }

  if (!themedOptions) {
    return defaultSound
  }

  if (ACTIVE_CUSTOM_THEME === CustomTheme.CHRISTMAS && isChristmasEnabled && themedOptions.winterSound) {
    return themedOptions.winterSound
  }

  if (
    ACTIVE_CUSTOM_THEME === CustomTheme.HALLOWEEN &&
    isHalloweenEnabled &&
    themedOptions.halloweenSound &&
    isDarkMode()
  ) {
    return themedOptions.halloweenSound
  }

  return defaultSound
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
