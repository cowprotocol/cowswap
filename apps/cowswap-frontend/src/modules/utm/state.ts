import { atomWithStorage } from 'jotai/utils'

import { UtmParams } from '@cowprotocol/common-utils'

export const utmAtom = atomWithStorage<UtmParams | undefined>('utm-atom:v1', undefined)
