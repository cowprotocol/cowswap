import { atomWithStorage } from 'jotai/utils'

export const alphaNetworksEnabledAtom = atomWithStorage<boolean>('alphaNetworksEnabled:v0', false, undefined, {
  getOnInit: true,
})
