import { atomWithStorage } from 'jotai/utils'

import { SolversInfo } from '../types'

export const solversInfoAtom = atomWithStorage<SolversInfo>('solversInfoAtom:v0', [])
