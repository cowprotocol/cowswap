type SoundType = 'SEND' | 'SUCCESS' | 'SUCCESS_CLAIM' | 'ERROR'
type Sounds = Record<SoundType, string>

const COW_SOUNDS: Sounds = {
  SEND: '/audio/send.mp3',
  SUCCESS: '/audio/success.mp3',
  SUCCESS_CLAIM: '/audio/success-claim.mp3',
  ERROR: '/audio/error.mp3',
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
