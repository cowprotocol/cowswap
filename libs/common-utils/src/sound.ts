type SoundType = 'SEND' | 'SUCCESS' | 'SUCCESS_CLAIM' | 'ERROR'
type Sounds = Record<SoundType, string>

const COW_SOUNDS_HALLOWEEN: Sounds = {
  SEND: '/audio/halloween.mp3',
  SUCCESS: '/audio/halloween.mp3',
  SUCCESS_CLAIM: '/audio/success-claim.mp3',
  ERROR: '/audio/error.mp3',
}

const COW_SOUNDS: Sounds = {
  SEND: '/audio/send.mp3',
  SUCCESS: '/audio/success.mp3',
  SUCCESS_CLAIM: '/audio/success-claim.mp3',
  ERROR: '/audio/error.mp3',
}

const SOUND_CACHE: Record<string, HTMLAudioElement | undefined> = {}

function getAudio(useHalloween: boolean, type: SoundType): HTMLAudioElement {
  const soundPath = useHalloween ? COW_SOUNDS_HALLOWEEN[type] : COW_SOUNDS[type]
  let sound = SOUND_CACHE[soundPath]

  if (!sound) {
    sound = new Audio(soundPath)
    SOUND_CACHE[soundPath] = sound
  }

  return sound
}

export function getCowSoundSend(useHalloween: boolean): HTMLAudioElement {
  return getAudio(useHalloween, 'SEND')
}

export function getCowSoundSuccess(useHalloween: boolean): HTMLAudioElement {
  return getAudio(useHalloween, 'SUCCESS')
}

export function getCowSoundSuccessClaim(useHalloween: boolean): HTMLAudioElement {
  return getAudio(useHalloween, 'SUCCESS_CLAIM')
}

export function getCowSoundError(useHalloween: boolean): HTMLAudioElement {
  return getAudio(useHalloween, 'ERROR')
}
