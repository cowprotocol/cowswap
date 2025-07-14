import { useSetAtom } from 'jotai'

import { HookDappOrderParams } from '@cowprotocol/hook-dapp-lib'

import { orderParamsStateAtom } from './orderParamsStateAtom'

export function useSetOrderParams(): (state: HookDappOrderParams | null) => void {
  return useSetAtom(orderParamsStateAtom)
}
