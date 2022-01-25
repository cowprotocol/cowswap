type SoundType = 'SEND' | 'SUCCESS' | 'ERROR'
type Sounds = Record<SoundType, string>

const COW_SOUNDS: Sounds = {
  SEND: '/audio/mooooo-send__lower-90.mp3',
  SUCCESS: '/audio/mooooo-success__ben__lower-90.mp3',
  ERROR: '/audio/mooooo-error__lower-90.mp3',
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

export function getCowSoundError(): HTMLAudioElement {
  return getAudio('ERROR')
}
