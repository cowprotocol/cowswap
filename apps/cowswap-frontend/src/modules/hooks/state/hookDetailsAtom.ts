import { atomWithStorage } from 'jotai/utils'

import { CowHookDetails } from '../types'

export const hooksAtom = atomWithStorage<{ preHooks: CowHookDetails[]; postHooks: CowHookDetails[] }>('hooks:v1', {
  preHooks: [],
  postHooks: [],
})
