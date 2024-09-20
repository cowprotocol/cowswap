import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { deepEqual } from '@cowprotocol/common-utils'

import { buildDocFilterFn, buildInverseDocFilterFn } from './utils'

import {
  AppDataInfo,
  AppDataPendingToUpload,
  RemoveAppDataFromUploadQueueParams,
  TypedAppDataHooks,
  UpdateAppDataOnUploadQueueParams,
  UploadAppDataParams,
} from '../types'
import { updateFullAppData } from '../utils/fullAppData'

/**
 * Base atom that store the current appDataInfo
 */
export const appDataInfoAtom = atom<AppDataInfo | null, [AppDataInfo | null], unknown>(
  null,
  (get, set, appDataInfo) => {
    const previous = get(appDataInfoAtom)

    // Do not update if both are equal to avoid unnecessary re-renders
    if (previous && appDataInfo && deepEqual(previous, appDataInfo)) {
      return
    }

    set(appDataInfoAtom, appDataInfo)
    updateFullAppData(appDataInfo?.fullAppData)
  },
)

/**
 * Base atom that stores all appData pending to be uploaded
 */
export const appDataUploadQueueAtom = atomWithStorage<AppDataPendingToUpload>(
  'appDataUploadQueue:v1', // local storage key
  [],
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
  },
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
  },
)

/**
 * Write only atom to remove appData from upload queue
 */
export const removeAppDataFromUploadQueueAtom = atom(
  null,
  (get, set, { chainId, orderId }: RemoveAppDataFromUploadQueueParams) => {
    set(appDataUploadQueueAtom, () => get(appDataUploadQueueAtom).filter(buildInverseDocFilterFn(chainId, orderId)))
  },
)

/**
 * In memory atom for storing the current appData hooks info
 */
export const appDataHooksAtom = atom<TypedAppDataHooks | undefined>(undefined)
