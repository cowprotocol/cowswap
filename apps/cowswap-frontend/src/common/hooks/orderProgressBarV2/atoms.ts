import { atom } from 'jotai'

import { ExecutingOrdersCountdown } from './types'

export const executingOrderCountdownAtom = atom<ExecutingOrdersCountdown>({})

type UpdateParams = {
  orderId: string
  value: number | null
}

export const updateSingleExecutingOrderCountdown = atom(null, (get, set, { orderId, value }: UpdateParams) => {
  const allCountdowns = { ...get(executingOrderCountdownAtom) }

  const currentValue = allCountdowns[orderId]

  if (currentValue === value) {
    return
  }

  if (value === null) {
    delete allCountdowns[orderId]
  } else {
    allCountdowns[orderId] = value
  }

  set(executingOrderCountdownAtom, allCountdowns)
})
