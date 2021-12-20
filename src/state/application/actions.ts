import { createAction } from '@reduxjs/toolkit'

// MOD: Modified PopupContent. The mod happened directly in the src file, to avoid redefining the state/hoos/etc
export type PopupContent = TxPopupContent | MetaTxPopupContent
// export interface MetaTxPopupContent {
//   metatxn: {
//     id: string
//     success: boolean
//     summary?: string | JSX.Element
//   }
// }

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
  DELEGATE,
  VOTE,
  POOL_OVERVIEW_OPTIONS,
  ARBITRUM_OPTIONS,
  // -----------------      MOD: CowSwap specific modals      --------------------
  TRANSACTION_CONFIRMATION,
  // ------------------------------------------------------------------------------
}

export type TxPopupContent = {
  txn: {
    hash: string
    success: boolean
    summary?: string
  }
}

export interface MetaTxPopupContent {
  metatxn: {
    id: string
    success: boolean
    summary?: string | JSX.Element
  }
}

export const updateChainId = createAction<{ chainId: number | null }>('application/updateChainId')
export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup =
  createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>('application/addPopup')
export const removePopup = createAction<{ key: string }>('application/removePopup')
