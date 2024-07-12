import { atom } from 'jotai'

import { CowHookDetails } from '@cowprotocol/types'

// TODO: use atomWithStorage instead. This might require serializing and deserializing carefully (or remodel the state), as the internal hook Dapps have a component, and the hooks have output tokens. We might need createJSONStorage

export const hooksAtom = atom<{ preHooks: CowHookDetails[]; postHooks: CowHookDetails[] }>({
  preHooks: [],
  postHooks: [],
})
