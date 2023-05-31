import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { buildDocFilterFn, buildInverseDocFilterFn } from './utils'

import {
  UploadAppDataParams,
  AppDataPendingToUpload,
  AppDataInfo,
  RemoveAppDataFromUploadQueueParams,
  UpdateAppDataOnUploadQueueParams,
} from '../types'
import { updateAppDataHash } from '../utils/appDataHash'

/**
 * Base atom that store the current appDataInfo
 */
export const appDataInfoAtom = atom<AppDataInfo | null, AppDataInfo | null>(null, (get, set, appDataInfo) => {
  set(appDataInfoAtom, appDataInfo)
  updateAppDataHash(appDataInfo?.hash ?? undefined)
})

/**
 * Base atom that stores all appData pending to be uploaded
 */
export const appDataUploadQueueAtom = atomWithStorage<AppDataPendingToUpload>(
  'appDataUploadQueue', // local storage key
  []
)

/**
 * Write only atom to add an appData to upload queue
 */
export const addAppDataToUploadQueueAtom = atom(
  null,
  (get, set, { chainId, orderId, appData }: UploadAppDataParams) => {
    set(appDataUploadQueueAtom, () => {
      const docs = get(appDataUploadQueueAtom)

      if (docs.some(buildDocFilterFn(chainId, orderId))) {
        // Entry already in the queue, ignore
        return docs
      }

      return [...docs, { chainId, orderId, ...appData, uploading: false, failedAttempts: 0 }]
    })
  }
)

/**
 * Write only atom to update upload status of an appData on upload queue
 */
export const updateAppDataOnUploadQueueAtom = atom(
  null,
  (get, set, { chainId, orderId, uploading, lastAttempt, failedAttempts }: UpdateAppDataOnUploadQueueParams) => {
    set(appDataUploadQueueAtom, () => {
      const docs = get(appDataUploadQueueAtom)
      const existingDocIndex = docs.findIndex(buildDocFilterFn(chainId, orderId))

      if (existingDocIndex === -1) {
        // Entry doesn't exist in the queue, ignore
        return docs
      }

      // Create a copy of original docs
      const updateDocs = docs.slice(0)

      // Using the index, get the value
      const existingDoc = docs[existingDocIndex]

      // Replace existing doc at index with the updated version
      updateDocs[existingDocIndex] = {
        ...existingDoc,
        uploading: uploading ?? existingDoc.uploading,
        lastAttempt: lastAttempt ?? existingDoc.lastAttempt,
        failedAttempts: failedAttempts ?? existingDoc.failedAttempts,
      }

      return updateDocs
    })
  }
)

/**
 * Write only atom to remove appData from upload queue
 */
export const removeAppDataFromUploadQueueAtom = atom(
  null,
  (get, set, { chainId, orderId }: RemoveAppDataFromUploadQueueParams) => {
    set(appDataUploadQueueAtom, () => get(appDataUploadQueueAtom).filter(buildInverseDocFilterFn(chainId, orderId)))
  }
)
