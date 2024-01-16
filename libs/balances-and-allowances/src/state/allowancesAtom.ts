import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

import { BigNumber } from '@ethersproject/bignumber'

import ms from 'ms.macro'

import { Erc20MulticallState } from '../types'

/**
 * Priority value is valid for 30 seconds after tx mined
 * After that, we use allowance from Updaters
 */
const PRIORITY_VALUE_TTL = ms`30s`

export interface AllowancesState extends Erc20MulticallState {
  /**
   * Since we update allowances periodically, we have a lag between the current allowance (in atom) and the actual allowance (blockchain)
   * To avoid this, we have a priority value that is updated immediately after tx mined (see FinalizeTxUpdater)
   */
  priorityValues: {
    [address: string]: {
      value: BigNumber | undefined
      timestamp: number
    }
  }
}

export const allowancesFullState = atomWithReset<AllowancesState>({ isLoading: false, values: {}, priorityValues: {} })

export const allowancesReadState = atom<Erc20MulticallState>((get) => {
  const { values, priorityValues, isLoading } = get(allowancesFullState)

  const computedValues = Object.keys(values).reduce<Erc20MulticallState['values']>((acc, address) => {
    const priorityValue = priorityValues[address]
    const isPriorityValueValid = priorityValue && Date.now() - priorityValue.timestamp < PRIORITY_VALUE_TTL

    acc[address] = isPriorityValueValid ? priorityValue.value : values[address]

    return acc
  }, {})

  return {
    isLoading,
    values: computedValues,
  }
})
