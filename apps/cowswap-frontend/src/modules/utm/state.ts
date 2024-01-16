import { atomWithStorage } from 'jotai/utils'

import { UtmParams } from './types'

export const utmAtom = atomWithStorage<UtmParams | undefined>('utm-atom:v1', undefined)
