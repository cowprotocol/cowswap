import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TOKENS_LISTS } from '../const/tokensLists'
import { TokenListsByChainState } from '../types'

export function getIsListEnabledForChain(
  source: string,
  chainId: SupportedChainId | undefined,
  listsStatesByChain: TokenListsByChainState,
): boolean {
  if (!chainId) return false

  const storedState = listsStatesByChain[chainId]?.[source]
  const storedPreference = storedState === 'deleted' ? undefined : storedState?.isEnabled

  if (typeof storedPreference === 'boolean') return storedPreference

  const configuredLists = DEFAULT_TOKENS_LISTS[chainId] ?? []

  return configuredLists.find((list) => list.source === source)?.enabledByDefault === true
}
