import { atom } from 'jotai'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'

export const tokenListsEnvironmentAtom = atom<{ chainId: SupportedChainId }>({
  chainId: getCurrentChainIdFromUrl(),
})
