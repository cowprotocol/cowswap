import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { CowHookDetailsSerialized } from '@cowprotocol/types'

type HooksStoreState = { preHooks: CowHookDetailsSerialized[]; postHooks: CowHookDetailsSerialized[] }

export const hooksAtom = atomWithStorage<HooksStoreState>(
  'hooks-store-atom:v1',
  {
    preHooks: [],
    postHooks: [],
  },
  getJotaiIsolatedStorage(),
)
