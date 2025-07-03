import { useAtomValue } from 'jotai'

import { HookDappOrderParams } from '@cowprotocol/hook-dapp-lib'

import { orderParamsStateAtom } from './orderParamsStateAtom'

export function useOrderParams(): HookDappOrderParams | null {
  return useAtomValue(orderParamsStateAtom)
}
