import { createAction } from '@reduxjs/toolkit'

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string

export type Tip = number

export const updateTip = createAction<{ token: string; tip: Tip }>('operator/updateTip')
export const clearTip = createAction<{ token: string }>('operator/clearTip')
