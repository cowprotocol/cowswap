import { atomWithStorage } from 'jotai/utils'

/**
 * "Enable Alpha Networks" swap setting: networks in alpha (Solana) stay out of the network pickers until the user
 * opts in. Their feature flags still apply on top. Direct links keep working regardless.
 */
export const alphaNetworksEnabledAtom = atomWithStorage<boolean>('alphaNetworksEnabled:v0', false, undefined, {
  getOnInit: true,
})
