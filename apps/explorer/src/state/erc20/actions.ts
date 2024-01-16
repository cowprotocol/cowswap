import { TokenErc20 } from '@gnosis.pm/dex-js'

import { Network } from 'types'

import { Actions } from 'state'

export type ActionTypes = 'SAVE_MULTIPLE_ERC20'

export type SaveMultipleErc20ActionType = Actions<ActionTypes, { erc20s: TokenErc20[]; networkId: Network }>
export type ReducerActionType = SaveMultipleErc20ActionType

export const saveMultipleErc20 = (erc20s: TokenErc20[], networkId: Network): SaveMultipleErc20ActionType => ({
  type: 'SAVE_MULTIPLE_ERC20',
  payload: { erc20s, networkId },
})

// Syntactic sugar
export const saveSingleErc20 = (erc20: TokenErc20, networkId: Network): SaveMultipleErc20ActionType =>
  saveMultipleErc20([erc20], networkId)
