import { useAtomValue } from 'jotai'

import { bridgeProvidersAtom } from './bridgeProvidersAtom'

export function useBridgeProvidersIds(): string[] {
  const providers = useAtomValue(bridgeProvidersAtom)

  return [...providers].map((p) => p.info.dappId)
}
