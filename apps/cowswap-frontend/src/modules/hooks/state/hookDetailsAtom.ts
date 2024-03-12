import { atomWithStorage } from 'jotai/utils'

import { CowHookDetails } from '../types'

export const hooksDetailsAtom = atomWithStorage<{ preHooks: CowHookDetails[]; postHooks: CowHookDetails[] }>(
  'hooks:v1',
  {
    preHooks: [],
    postHooks: [],
  }
)
