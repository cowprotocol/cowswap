import { CHRISTMAS_THEME_ENABLED } from '@cowprotocol/common-const'

type SoundType = 'SEND' | 'SUCCESS' | 'SUCCESS_CLAIM' | 'ERROR' | 'IM_FEELING_LUCKY'
type Sounds = Record<SoundType, string>

const COW_SOUNDS: Sounds = {
  SEND: CHRISTMAS_THEME_ENABLED ? '/audio/send-winterTheme.mp3' : '/audio/send.mp3',
  SUCCESS: '/audio/success.mp3',
  SUCCESS_CLAIM: '/audio/success-claim.mp3',
  ERROR: '/audio/error.mp3',
  IM_FEELING_LUCKY: '/audio/slot-machine.mp3',
}

const SOUND_CACHE: Record<string, HTMLAudioElement | undefined> = {}

function getAudio(type: SoundType): HTMLAudioElement {
  const soundPath = COW_SOUNDS[type]
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

export function getCowSoundSuccessClaim(): HTMLAudioElement {
  return getAudio('SUCCESS_CLAIM')
}

export function getCowSoundError(): HTMLAudioElement {
  return getAudio('ERROR')
}

export function getImFeelingLuckySound(): HTMLAudioElement {
  return getAudio('IM_FEELING_LUCKY')
}
