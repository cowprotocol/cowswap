import { useAtomValue, useSetAtom } from 'jotai'

import {
  LimitOrdersRawState,
  limitOrdersRawStateAtom,
  updateLimitOrdersRawStateAtom,
} from '../state/limitOrdersRawStateAtom'

export function useLimitOrdersRawState(): LimitOrdersRawState {
  return useAtomValue(limitOrdersRawStateAtom)
}

export function useUpdateLimitOrdersRawState(): (update: Partial<LimitOrdersRawState>) => void {
  return useSetAtom(updateLimitOrdersRawStateAtom)
}
