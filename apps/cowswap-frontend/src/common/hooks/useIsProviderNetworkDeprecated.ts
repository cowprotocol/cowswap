import { useAtomValue } from 'jotai'

import { isProviderNetworkDeprecatedAtom } from 'entities/common/isProviderNetworkDeprecated.atom'

export function useIsProviderNetworkDeprecated(): boolean {
  return useAtomValue(isProviderNetworkDeprecatedAtom)
}
