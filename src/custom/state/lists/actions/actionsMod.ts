import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { TokenList, Version } from '@uniswap/token-lists'
import { SupportedChainId as ChainId } from 'constants/chains'
export { SupportedChainId as ChainId } from 'constants/chains'

export interface WithChainId {
  chainId?: ChainId
}

interface WithChainIdAndUrl extends WithChainId {
  url: string
}

interface PendingFetchTokenList extends WithChainIdAndUrl {
  requestId: string
}

interface FulfilledFetchTokenList extends PendingFetchTokenList {
  tokenList: TokenList
}

interface RejectedFetchTokenList extends PendingFetchTokenList {
  errorMessage: string
}

export type RemoveGpUnsupportedTokenParams = WithChainId & { address: string }
export type AddGpUnsupportedTokenParams = RemoveGpUnsupportedTokenParams & { dateAdded: number }

//MOD: adds chainId to param
export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithPayload<PendingFetchTokenList>
  fulfilled: ActionCreatorWithPayload<FulfilledFetchTokenList>
  rejected: ActionCreatorWithPayload<RejectedFetchTokenList>
}> = {
  pending: createAction<PendingFetchTokenList>('lists/fetchTokenList/pending'),
  fulfilled: createAction<FulfilledFetchTokenList>('lists/fetchTokenList/fulfilled'),
  rejected: createAction<RejectedFetchTokenList>('lists/fetchTokenList/rejected'),
}
// add and remove from list options
export const addList = createAction<WithChainIdAndUrl>('lists/addList')
export const removeList = createAction<WithChainIdAndUrl>('lists/removeList')

// select which lists to search across from loaded lists
export const enableList = createAction<WithChainIdAndUrl>('lists/enableList')
export const disableList = createAction<WithChainIdAndUrl>('lists/disableList')

// versioning
export const acceptListUpdate = createAction<WithChainIdAndUrl>('lists/acceptListUpdate')
export const rejectVersionUpdate = createAction<WithChainId & { version: Version }>('lists/rejectVersionUpdate')

// add/remove unsupported token for gp
export const addGpUnsupportedToken = createAction<AddGpUnsupportedTokenParams>('lists/addGpUnsupportedToken')
export const removeGpUnsupportedToken = createAction<RemoveGpUnsupportedTokenParams>('lists/removeGpUnsupportedToken')
