import { useAtomValue } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { affiliateSupportedChainIdsAtom } from '../state/affiliateSupportedChainIdsAtom'

export function useAffiliateSupportedChainIds(): readonly SupportedChainId[] {
  return useAtomValue(affiliateSupportedChainIdsAtom)
}
