import { atom } from 'jotai'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'

export const MAX_EOA_TWAP_ORDERS_LIMIT = 1000

export interface EoaTwapOrdersRequestState {
  requestKey: string
  limit: number
  isLoading: boolean
  totalCount: number | null
}

export const eoaTwapOrdersRequestAtom = atom<EoaTwapOrdersRequestState>(getInitialEoaTwapOrdersRequestState(''))

export function getInitialEoaTwapOrdersRequestState(requestKey: string): EoaTwapOrdersRequestState {
  return {
    requestKey,
    limit: AMOUNT_OF_ORDERS_TO_FETCH,
    isLoading: false,
    totalCount: null,
  }
}

export function selectEoaTwapOrdersRequestState(
  state: EoaTwapOrdersRequestState,
  requestKey: string,
): EoaTwapOrdersRequestState {
  return state.requestKey === requestKey ? state : getInitialEoaTwapOrdersRequestState(requestKey)
}
