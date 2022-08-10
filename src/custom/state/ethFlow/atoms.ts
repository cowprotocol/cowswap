import { atomWithStorage, useUpdateAtom, useAtomValue, selectAtom } from 'jotai/utils'

export { useUpdateAtom, useAtomValue, selectAtom }

/**
 * Base atom that stores the user's set native ETH sell value
 */
export const userNativeEthFlow = atomWithStorage<boolean>('userNativeEthFlow', false)
export const isUserNativeEthFlow = selectAtom(userNativeEthFlow, (value) => value)
