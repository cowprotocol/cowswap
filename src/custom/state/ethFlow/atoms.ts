import { selectAtom } from 'jotai/utils'
import { atomWithStorage } from './atoms/utils'

/**
 * Base atom that stores the user's set native ETH sell value
 */
export const userNativeEthFlow = atomWithStorage<boolean>('userNativeEthFlow', true)
export const isUserNativeEthFlow = selectAtom(userNativeEthFlow, (value) => value)
