import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { ListsState } from '@src/state/lists/reducer'
import { ChainId } from '@uniswap/sdk'
import { TokenList } from '@uniswap/token-lists'

export * from '@src/state/lists/actions'

export const initialiseTokenLists = createAction<ListsState>('lists/initialiseTokenLists')

export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>
  // fulfilled: ActionCreatorWithPayload<{ url: string; tokenList: TokenList; requestId: string; }>
  fulfilled: ActionCreatorWithPayload<{ url: string; tokenList: TokenList; requestId: string; chainId?: ChainId }>
  rejected: ActionCreatorWithPayload<{ url: string; errorMessage: string; requestId: string }>
}> = {
  pending: createAction('lists/fetchTokenList/pending'),
  fulfilled: createAction('lists/fetchTokenList/fulfilled'),
  rejected: createAction('lists/fetchTokenList/rejected')
}
