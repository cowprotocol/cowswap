import { APRILS_FOOLS_FLAG_KEY, CustomTheme, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import type { FeatureFlags } from '@cowprotocol/common-const'
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

const APRIL_FOOL_STORAGE_KEY = 'lastAprilFoolSoundSelections' as const

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
  let played: string[] = []
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(APRIL_FOOL_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed)) {
        played = parsed.filter((value): value is string => typeof value === 'string')
      }
    } catch {
      // Ignore parse errors and reset the cycle
    }
  }

  let pool = APRIL_FOOL_SOUND_SEND.filter((sound) => !played.includes(sound))
  if (pool.length === 0) {
    played = []
    pool = [...APRIL_FOOL_SOUND_SEND]
  }

  const randomPick = pool[Math.floor(Math.random() * pool.length)]
  const nextPlayed = [...played, randomPick]
  const stored = nextPlayed.length === APRIL_FOOL_SOUND_SEND.length ? [] : nextPlayed

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(APRIL_FOOL_STORAGE_KEY, JSON.stringify(stored))
    } catch {
      // Ignore storage quota or availability errors; audio rotation still works in-memory
    }
  }

  return randomPick
}

function getSeasonalSounds(featureFlags?: FeatureFlags): Partial<Sounds> {
  const darkModeEnabled = isDarkMode()
  const activeSeasonalTheme = resolveCustomThemeForContext(featureFlags, { darkModeEnabled })

  if (activeSeasonalTheme === CustomTheme.HALLOWEEN) return HALLOWEEN_SOUNDS
  if (activeSeasonalTheme === CustomTheme.CHRISTMAS) return WINTER_SOUNDS

  return {}
}

function getThemeBasedSound(type: SoundType): string {
  const featureFlags = jotaiStore.get(featureFlagsAtom) as FeatureFlags
  const isAprilsFoolsEnabled = Boolean(featureFlags?.[APRILS_FOOLS_FLAG_KEY])

  if (isAprilsFoolsEnabled && type === 'SEND') {
    return pickRandomAprilsFoolSound()
  }

  const themedSounds = getSeasonalSounds(featureFlags)
  return themedSounds[type] || DEFAULT_COW_SOUNDS[type]
}

const SOUND_CACHE: Record<string, HTMLAudioElement | undefined> = {}

function getEmptySound(): HTMLAudioElement {
  if (typeof Audio !== 'undefined') {
    return new Audio('')
  }

  const stub: Partial<HTMLAudioElement> = {
    play: () => Promise.resolve(),
    pause: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }

  return stub as HTMLAudioElement
}

function createAudioOrEmpty(src: string): HTMLAudioElement {
  return typeof Audio !== 'undefined' ? new Audio(src) : getEmptySound()
}

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
      return getEmptySound()
    }
    // If in widget mode, use widget sound if provided, otherwise use default sound
    const soundPath = widgetSound || DEFAULT_COW_SOUNDS[type]
    let sound = SOUND_CACHE[soundPath]

    if (!sound) {
      sound = createAudioOrEmpty(soundPath)
      SOUND_CACHE[soundPath] = sound
    }

    return sound
  }

  // If not in widget mode, use theme-based sound
  const soundPath = getThemeBasedSound(type)
  let sound = SOUND_CACHE[soundPath]

  if (!sound) {
    sound = createAudioOrEmpty(soundPath)
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

export const __soundTestUtils = {
  getThemeBasedSound,
} as const
