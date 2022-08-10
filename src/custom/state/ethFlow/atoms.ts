import { atomWithStorage, selectAtom } from 'jotai/utils'

/**
 * Base atom that stores the user's set native ETH sell value
 */
export const userNativeEthFlow = atomWithStorage<boolean>('userNativeEthFlow', false)
export const isUserNativeEthFlow = selectAtom(userNativeEthFlow, (value) => value)
