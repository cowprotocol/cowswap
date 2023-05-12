import { UtmParams } from './types'
import { atomWithStorage } from 'jotai/utils'

export const utmAtom = atomWithStorage<UtmParams | undefined>('utm-atom:v1', undefined)
