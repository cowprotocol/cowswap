import { CHRISTMAS_THEME_ENABLED } from '@cowprotocol/common-const'
import { jotaiStore } from '@cowprotocol/core'
import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { injectedWidgetParamsAtom } from 'modules/injectedWidget/state/injectedWidgetParamsAtom'

type SoundType = 'SEND' | 'SUCCESS' | 'ERROR'
type Sounds = Record<SoundType, string>
type WidgetSounds = keyof NonNullable<CowSwapWidgetParams['sounds']>

const COW_SOUNDS: Sounds = {
  SEND: CHRISTMAS_THEME_ENABLED ? '/audio/send-winterTheme.mp3' : '/audio/send.mp3',
  SUCCESS: '/audio/success.mp3',
  ERROR: '/audio/error.mp3',
}

const COW_SOUND_TO_WIDGET_KEY: Record<SoundType, WidgetSounds> = {
  SEND: 'postOrder',
  SUCCESS: 'orderExecuted',
  ERROR: 'orderError',
}

const SOUND_CACHE: Record<string, HTMLAudioElement | undefined> = {}

function getWidgetSoundUrl(type: SoundType): string | undefined {
  const { params } = jotaiStore.get(injectedWidgetParamsAtom)
  const key = COW_SOUND_TO_WIDGET_KEY[type]

  return params?.sounds?.[key] || undefined
}

function getAudio(type: SoundType): HTMLAudioElement {
  const soundPath = getWidgetSoundUrl(type) || COW_SOUNDS[type]
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
