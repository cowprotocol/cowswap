import { atom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { FetchedTokenList } from '@cowprotocol/tokens'
import { Currency } from '@uniswap/sdk-core'

export const { atom: selectTokenWidgetAtom, updateAtom: updateSelectTokenWidgetAtom } = atomWithPartialUpdate(
  atom<{
    open: boolean
    selectedToken?: string
    tokenToImport?: TokenWithLogo
    listToImport?: FetchedTokenList
    onSelectToken?: (currency: Currency) => void
  }>({ open: false })
)
