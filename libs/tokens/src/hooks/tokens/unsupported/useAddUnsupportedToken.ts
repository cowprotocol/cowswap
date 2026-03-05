import { useSetAtom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { addUnsupportedTokenAtom } from '../../../state/tokens/unsupportedTokensAtom'

export type AddUnsupportedToken = (chainId: SupportedChainId, tokenAddress: string) => void

export function useAddUnsupportedToken(): AddUnsupportedToken {
  return useSetAtom(addUnsupportedTokenAtom)
}
