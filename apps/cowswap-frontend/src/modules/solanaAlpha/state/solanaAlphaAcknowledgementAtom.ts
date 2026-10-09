import { atomWithStorage } from 'jotai/utils'

export const solanaAlphaAcknowledgedAtom = atomWithStorage<boolean>('solanaAlphaAcknowledged:v0', false, undefined, {
  getOnInit: true,
})
