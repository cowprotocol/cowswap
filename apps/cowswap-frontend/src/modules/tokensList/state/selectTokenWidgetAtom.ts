import { atom } from 'jotai'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { ListState } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Field } from 'legacy/state/types'

export const { atom: selectTokenWidgetAtom, updateAtom: updateSelectTokenWidgetAtom } = atomWithPartialUpdate(
  atom<{
    open: boolean
    field?: Field
    oppositeToken?: TokenWithLogo | LpToken | Currency
    selectedToken?: Nullish<Currency>
    selectedPoolAddress?: string
    tokenToImport?: TokenWithLogo
    listToImport?: ListState
    onSelectToken?: (currency: Currency) => void
    onInputPressEnter?: Command
    selectedTargetChainId?: number
  }>({ open: false }),
)
