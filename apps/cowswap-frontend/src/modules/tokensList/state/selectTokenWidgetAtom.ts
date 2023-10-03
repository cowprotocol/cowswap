import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { Currency } from '@uniswap/sdk-core'

export const { atom: selectTokenWidgetAtom, updateAtom: updateSelectTokenWidgetAtom } = atomWithPartialUpdate(
  atom<{
    open: boolean
    onSelectToken?: (currency: Currency) => void
  }>({ open: false })
)
