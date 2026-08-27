import { useAtomValue } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { listsStatesByChainAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { getIsListEnabledForChain } from '../../utils/getIsListEnabledForChain'

export function useIsListEnabledForChain(source: string, chainId: SupportedChainId | undefined): boolean {
  const listsStatesByChain = useAtomValue(listsStatesByChainAtom)

  return getIsListEnabledForChain(source, chainId, listsStatesByChain)
}
