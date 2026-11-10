import { useAtomValue } from 'jotai'

import { affiliateSupportedNetworkNamesAtom } from '../state/affiliateSupportedChainIdsAtom'

export function useAffiliateSupportedNetworkNames(): string[] {
  return useAtomValue(affiliateSupportedNetworkNamesAtom)
}
