import { createAction } from '@reduxjs/toolkit'
import { SerializedToken } from '@src/state/user/actions'
export * from '@src/state/user/actions'

export const toggleFavouriteToken = createAction<{ serializedToken: SerializedToken }>('user/toggleFavouriteToken')
export const removeAllFavouriteTokens = createAction<{ chainId: number }>('user/removeAllFavouriteTokens')
