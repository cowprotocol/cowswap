import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  AddAppDataToUploadQueueParams,
  AppDataDocsPendingToUpload,
  AppDataInfo,
  AppDataRecord,
  RemoveAppDataFromUploadQueueParams,
  UpdateAppDataOnUploadQueueParams,
} from 'state/appData/types'

// TODO: what about making it flat?
// TODO: there's no benefit on it being split by network AFAICT
const INITIAL_APP_DATA_DOC_PENDING_TO_UPLOAD: AppDataDocsPendingToUpload = {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.RINKEBY]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
}

/**
 * Base atom that store the current appDataInfo
 */
export const appDataInfoAtom = atom<AppDataInfo | null>(null)

/**
 * Base atom that stores all appData pending to be uploaded
 */
export const appDataUploadQueueAtom = atomWithStorage(
  'pendingUploadAppDataDocs', // local storage key
  INITIAL_APP_DATA_DOC_PENDING_TO_UPLOAD
)

/**
 * Write only atom to add an appData to upload queue
 */
export const addAppDataToUploadQueueAtom = atom(
  null,
  (get, set, { chainId, orderId, appData }: AddAppDataToUploadQueueParams) => {
    set(appDataUploadQueueAtom, () => {
      const docs = get(appDataUploadQueueAtom)
      return {
        ...docs,
        [chainId]: {
          ...docs[chainId],
          [orderId]: { ...appData, uploading: false },
        },
      }
    })
  }
)

/**
 * Write only atom to update upload status of an appData on upload queue
 */
export const updateAppDataOnUploadQueueAtom = atom(
  null,
  (get, set, { chainId, orderId, uploading, tryAfter }: UpdateAppDataOnUploadQueueParams) => {
    set(appDataUploadQueueAtom, () => {
      const docs = get(appDataUploadQueueAtom)
      console.debug(`atoms/update`, chainId, orderId, uploading, tryAfter)
      if (!docs[chainId][orderId]) {
        return docs
      }
      return {
        ...docs,
        [chainId]: {
          ...docs[chainId],
          [orderId]: { ...docs[chainId][orderId], uploading, tryAfter },
        },
      }
    })
  }
)

// TODO: if we make the queue a flat structure, this atom will not be needed
type T = Omit<AddAppDataToUploadQueueParams, 'appData'> & AppDataRecord
export const filterUpdatableAtom = atom((get) => {
  const docs = get(appDataUploadQueueAtom)
  // for every network
  const result: T[] = []
  Object.keys(docs).forEach((_chainId) => {
    const chainId = _chainId as unknown as SupportedChainId
    const perChainId = docs[chainId]
    // for every order
    Object.keys(perChainId).forEach((orderId) => {
      const singleDoc = perChainId[orderId]
      result.push({ chainId, orderId, ...singleDoc })
    })
  })
  return result
})

/**
 * Write only atom to remove appData from upload queue
 */
export const removeAppDataFromUploadQueueAtom = atom(
  null,
  (get, set, { chainId, orderId }: RemoveAppDataFromUploadQueueParams) => {
    set(appDataUploadQueueAtom, () => {
      const docs = { ...get(appDataUploadQueueAtom) }
      console.debug(`atoms/remove`, chainId, orderId)
      delete docs[chainId][orderId]
      return docs
    })
  }
)
