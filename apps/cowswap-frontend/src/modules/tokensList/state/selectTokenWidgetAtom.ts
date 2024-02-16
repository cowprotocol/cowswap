import { atom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { ListState } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

export const { atom: selectTokenWidgetAtom, updateAtom: updateSelectTokenWidgetAtom } = atomWithPartialUpdate(
  atom<{
    open: boolean
    selectedToken?: string
    tokenToImport?: TokenWithLogo
    listToImport?: ListState
    onSelectToken?: (currency: Currency) => void
    onInputPressEnter?: Command
  }>({ open: false })
)
