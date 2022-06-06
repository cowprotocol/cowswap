import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import {
  AddAppDataToUploadQueueParams,
  AppDataPendingToUpload,
  AppDataInfo,
  FlattenedAppDataFromUploadQueue,
  RemoveAppDataFromUploadQueueParams,
  UpdateAppDataOnUploadQueueParams,
} from 'state/appData/types'
import { buildAppDataRecordKey, parseAppDataRecordKey } from 'state/appData/utils'

const INITIAL_APP_DATA_UPLOAD_QUEUE: AppDataPendingToUpload = {}

/**
 * Base atom that store the current appDataInfo
 */
export const appDataInfoAtom = atom<AppDataInfo | null>(null)

/**
 * Base atom that stores all appData pending to be uploaded
 */
export const appDataUploadQueueAtom = atomWithStorage(
  'appDataUploadQueue', // local storage key
  INITIAL_APP_DATA_UPLOAD_QUEUE
)

/**
 * Write only atom to add an appData to upload queue
 */
export const addAppDataToUploadQueueAtom = atom(
  null,
  (get, set, { chainId, orderId, appData }: AddAppDataToUploadQueueParams) => {
    set(appDataUploadQueueAtom, () => {
      const docs = get(appDataUploadQueueAtom)
      const key = buildAppDataRecordKey({ chainId, orderId })

      return {
        ...docs,
        [key]: { ...appData, uploading: false },
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
      const key = buildAppDataRecordKey({ chainId, orderId })

      if (!docs[key]) {
        return docs
      }

      return {
        ...docs,
        [key]: { ...docs[key], uploading, tryAfter },
      }
    })
  }
)

/**
 * Write only atom to remove appData from upload queue
 */
export const removeAppDataFromUploadQueueAtom = atom(
  null,
  (get, set, { chainId, orderId }: RemoveAppDataFromUploadQueueParams) => {
    set(appDataUploadQueueAtom, () => {
      const docs = { ...get(appDataUploadQueueAtom) }
      const key = buildAppDataRecordKey({ chainId, orderId })

      delete docs[key]

      return docs
    })
  }
)

/**
 * Read only atom to flatten pending list of appData into a list
 */
export const flattenedAppDataFromUploadQueueAtom = atom((get) => {
  const docs = get(appDataUploadQueueAtom)

  return Object.keys(docs).map<FlattenedAppDataFromUploadQueue>((key) => ({
    ...docs[key],
    ...parseAppDataRecordKey(key),
  }))
})
