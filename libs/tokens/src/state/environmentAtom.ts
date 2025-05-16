import { atom } from 'jotai'

import { atomWithPartialUpdate, getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId, ChainInfo } from '@cowprotocol/cow-sdk'

interface TokensModuleEnvironment {
  chainId: SupportedChainId
  useCuratedListOnly?: boolean
  enableLpTokensByDefault?: boolean
  isYieldEnabled?: boolean
  widgetAppCode?: string
  selectedLists?: string[]
  bridgeNetworkInfo?: ChainInfo[]
}
export const { atom: environmentAtom, updateAtom: updateEnvironmentAtom } = atomWithPartialUpdate(
  atom<TokensModuleEnvironment>({
    chainId: getCurrentChainIdFromUrl(),
  }),
)
