import { atom, SetStateAction, WritableAtom } from 'jotai'

import { atomWithPartialUpdate, getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId, ChainInfo } from '@cowprotocol/cow-sdk'

type EnvironmentAtom = WritableAtom<TokensModuleEnvironment, [SetStateAction<TokensModuleEnvironment>], void>

interface TokensModuleEnvironment {
  chainId: SupportedChainId
  useCuratedListOnly?: boolean
  enableLpTokensByDefault?: boolean
  isYieldEnabled?: boolean
  widgetAppCode?: string
  selectedLists?: string[]
  bridgeNetworkInfo?: ChainInfo[]
}
type UpdateEnvironmentAtom = WritableAtom<null, [SetStateAction<Partial<TokensModuleEnvironment>>], void>

const environmentStateAtom = atom<TokensModuleEnvironment>({
  chainId: getCurrentChainIdFromUrl(),
})

const environmentStateWithPartialUpdate: {
  atom: EnvironmentAtom
  updateAtom: UpdateEnvironmentAtom
} = atomWithPartialUpdate(environmentStateAtom)

export const environmentAtom = environmentStateWithPartialUpdate.atom
export const updateEnvironmentAtom = environmentStateWithPartialUpdate.updateAtom
