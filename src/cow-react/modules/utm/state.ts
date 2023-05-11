import { UtmParams } from './types'
import { atomWithStorage } from 'jotai/utils'

export const utmAtom = atomWithStorage<UtmParams>('utm-atom:v1', {})
