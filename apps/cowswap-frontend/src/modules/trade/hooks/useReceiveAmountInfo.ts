import { useAtomValue } from 'jotai'

import { receiveAmountInfoAtom } from '../state/receiveAmountInfoAtom'
import { ReceiveAmountInfo } from '../types'

export function useReceiveAmountInfo(): ReceiveAmountInfo | null {
  return useAtomValue(receiveAmountInfoAtom)
}
