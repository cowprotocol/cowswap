import { createSlice, nanoid } from '@reduxjs/toolkit'
import { DEFAULT_TXN_DISMISS_MS } from 'constants/misc'

// import { SupportedChainId } from '../../constants/chains'
//
// export type PopupContent =
//   | {
//       txn: {
//         hash: string
//       }
//     }
// TODO: check whether this could be useful for us
//   | {
//       failedSwitchNetwork: SupportedChainId
//     }

// MOD: Modified PopupContent. The mod happened directly in the src file, to avoid redefining the state/hoos/etc
export type PopupContent = TxPopupContent | MetaTxPopupContent

export type TxPopupContent = {
  txn: {
    hash: string
    success?: boolean
    summary?: string
  }
}

export interface MetaTxPopupContent {
  metatxn: {
    id: string
    success?: boolean
    summary?: string | JSX.Element
  }
}

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
  NETWORK_SELECTOR,
  PRIVACY_POLICY,
  // -----------------      MOD: CowSwap specific modals      --------------------
  TRANSACTION_CONFIRMATION,
  TRANSACTION_ERROR,
  ARBITRUM_OPTIONS,
  // ------------------------------------------------------------------------------
}

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  readonly chainId: number | null
  readonly openModal: ApplicationModal | null
  readonly popupList: PopupList
}

const initialState: ApplicationState = {
  chainId: null,
  openModal: null,
  popupList: [],
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    updateChainId(state, action) {
      const { chainId } = action.payload
      state.chainId = chainId
    },
    setOpenModal(state, action) {
      state.openModal = action.payload
    },
    addPopup(state, { payload: { content, key, removeAfterMs = DEFAULT_TXN_DISMISS_MS } }) {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    },
    removePopup(state, { payload: { key } }) {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    },
  },
})

export const { updateChainId, setOpenModal, addPopup, removePopup } = applicationSlice.actions
export default applicationSlice.reducer
