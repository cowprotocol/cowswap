import { atom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { Currency } from '@uniswap/sdk-core'

export const { atom: selectTokenWidgetAtom, updateAtom: updateSelectTokenWidgetAtom } = atomWithPartialUpdate(
  atom<{
    open: boolean
    tokenToImport?: TokenWithLogo
    onSelectToken?: (currency: Currency) => void
  }>({ open: false })
)
