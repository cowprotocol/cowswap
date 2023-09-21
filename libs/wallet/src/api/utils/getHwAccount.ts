import { jotaiStore } from '@cowprotocol/core'

import { hwAccountIndexAtom } from '../state'

export const TREZOR_DERIVATION_PATH = `m/44'/60'/0'/0`

export function getHwAccount(): { index: number; path: string } {
  const index = jotaiStore.get(hwAccountIndexAtom)
  const path = `${TREZOR_DERIVATION_PATH}/${index}`

  return { index, path }
}
