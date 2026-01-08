import { atom } from 'jotai'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { ListState } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types'

export interface SelectTokenWidgetState {
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
  tradeType?: TradeType
  forceOpen?: boolean
  // UI config
  standalone?: boolean
  displayLpTokenLists?: boolean
}

export const DEFAULT_SELECT_TOKEN_WIDGET_STATE: SelectTokenWidgetState = {
  open: false,
  field: undefined,
  selectedToken: undefined,
  onSelectToken: undefined,
  tokenToImport: undefined,
  listToImport: undefined,
  selectedPoolAddress: undefined,
  selectedTargetChainId: undefined,
  tradeType: undefined,
  forceOpen: false,
  standalone: false,
  displayLpTokenLists: false,
}

export const { atom: selectTokenWidgetAtom, updateAtom: updateSelectTokenWidgetAtom } = atomWithPartialUpdate(
  atom<SelectTokenWidgetState>(DEFAULT_SELECT_TOKEN_WIDGET_STATE),
)
