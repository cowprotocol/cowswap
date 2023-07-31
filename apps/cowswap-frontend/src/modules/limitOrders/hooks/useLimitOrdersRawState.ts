import { useAtomValue, useSetAtom } from 'jotai'

import {
  limitOrdersRawStateAtom,
  LimitOrdersRawState,
  updateLimitOrdersRawStateAtom,
} from '../state/limitOrdersRawStateAtom'

export function useLimitOrdersRawState(): LimitOrdersRawState {
  return useAtomValue(limitOrdersRawStateAtom)
}

export function useUpdateLimitOrdersRawState(): (update: Partial<LimitOrdersRawState>) => void {
  return useSetAtom(updateLimitOrdersRawStateAtom)
}
