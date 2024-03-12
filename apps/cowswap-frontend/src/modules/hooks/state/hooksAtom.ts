import { atomWithStorage } from 'jotai/utils'

import { PermitHookData } from '../types'

export const hooksAtom = atomWithStorage<{ preHooks: PermitHookData[]; postHooks: PermitHookData[] }>('hooks:v1', {
  preHooks: [],
  postHooks: [],
})
