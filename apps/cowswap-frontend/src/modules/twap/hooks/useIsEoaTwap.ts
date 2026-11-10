import { useAtomValue } from 'jotai'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isEoaAtom, isSafeAppAtom } from '@cowprotocol/wallet'

export function useIsEoaTwap(): boolean {
  const { isTwapEoaEnabled } = useFeatureFlags()
  const isSafeApp = useAtomValue(isSafeAppAtom)
  const isEoa = useAtomValue(isEoaAtom)

  return isSafeApp === false && !!isTwapEoaEnabled && isEoa === true
}
