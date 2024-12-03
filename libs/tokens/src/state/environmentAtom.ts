import { atom } from 'jotai'

import { atomWithPartialUpdate, getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

interface TokensModuleEnvironment {
  chainId: SupportedChainId
  useCuratedListOnly?: boolean
  enableLpTokensByDefault?: boolean
  isYieldEnabled?: boolean
  widgetAppCode?: string
  selectedLists?: string[]
}
export const { atom: environmentAtom, updateAtom: updateEnvironmentAtom } = atomWithPartialUpdate(
  atom<TokensModuleEnvironment>({
    chainId: getCurrentChainIdFromUrl(),
  }),
)
