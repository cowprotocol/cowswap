import { jotaiStore } from 'jotaiStore'

import { hwAccountIndexAtom } from '../state'

export function getHwAccount(): { index: number; path: string } {
  const index = jotaiStore.get(hwAccountIndexAtom)
  const path = `m/44'/60'/0'/0/${index}`

  return { index, path }
}
