import { useAtomValue } from 'jotai'

import { tradingSdkAtom } from './tradingSdkAtom'

export function useTradingSdk() {
  return useAtomValue(tradingSdkAtom)
}
