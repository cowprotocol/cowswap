import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import ms from 'ms.macro'

import { uploadAppDataDocOrderbookApi } from '../services'
import {
  appDataUploadQueueAtom,
  removeAppDataFromUploadQueueAtom,
  updateAppDataOnUploadQueueAtom,
} from '../state/atoms'
import { AppDataKeyParams, AppDataRecord, UpdateAppDataOnUploadQueueParams } from '../types'

const UPLOAD_CHECK_INTERVAL = ms`1 minute`
const BASE_FOR_EXPONENTIAL_BACKOFF = 2 // in seconds, converted to milliseconds later
const ONE_SECOND = ms`1s`
const MAX_TIME_TO_WAIT = ms`5 minutes`

export function UploadToIpfsUpdater(): null {
  const toUpload = useAtomValue(appDataUploadQueueAtom)
  const removePending = useSetAtom(removeAppDataFromUploadQueueAtom)
  const updatePending = useSetAtom(updateAppDataOnUploadQueueAtom)

  // Storing a reference to avoid re-render on every update
  const refToUpload = useRef(toUpload)
  refToUpload.current = toUpload

  // Filtering only newly created and not yet attempted to upload docs
  const newlyAdded = toUpload.filter(({ uploading, lastAttempt }) => !uploading && !lastAttempt)

  useEffect(() => {
    // Try to upload new docs as soon as they are added
    newlyAdded.forEach((appDataRecord) => _uploadToIpfs(appDataRecord, updatePending, removePending))
  }, [newlyAdded, removePending, updatePending])

  useEffect(() => {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async function uploadPendingAppData() {
      console.debug(`[UploadToIpfsUpdater] Iterating over ${refToUpload.current.length} appData on upload queue`)
      refToUpload.current.forEach((appDataRecord) => _uploadToIpfs(appDataRecord, updatePending, removePending))
    }

    const intervalId = setInterval(uploadPendingAppData, UPLOAD_CHECK_INTERVAL)

    return () => {
      clearInterval(intervalId)
    }
  }, [removePending, updatePending])

  return null
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function _uploadToIpfs(
  appDataRecord: AppDataRecord,
  updatePending: (params: UpdateAppDataOnUploadQueueParams) => void,
  removePending: (params: AppDataKeyParams) => void
) {
  const { fullAppData, appDataKeccak256, chainId, orderId, uploading, failedAttempts, lastAttempt } = appDataRecord

  if (!fullAppData || !appDataKeccak256) {
    // No actual doc to upload, nothing to do here
    removePending({ chainId, orderId })
  } else if (_canUpload(uploading, failedAttempts, lastAttempt)) {
    await _actuallyUploadToIpfs(appDataRecord, updatePending, removePending)
  } else {
    console.log(`[UploadToIpfsUpdater] Criteria not met, skipping ${chainId}-${orderId}`)
  }
}

function _canUpload(uploading: boolean, attempts: number, lastAttempt?: number): boolean {
  if (uploading) {
    return false
  }

  if (lastAttempt) {
    // Every attempt takes BASE_FOR_EXPONENTIAL_BACKOFF ˆ failedAttempts
    const timeToWait = BASE_FOR_EXPONENTIAL_BACKOFF ** attempts * ONE_SECOND
    // Don't wait more than MAX_TIME_TO_WAIT.
    // Both are in milliseconds
    const timeDelta = Math.min(timeToWait, MAX_TIME_TO_WAIT)

    return lastAttempt + timeDelta <= Date.now()
  }

  return true
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function _actuallyUploadToIpfs(
  appDataRecord: AppDataRecord,
  updatePending: (params: UpdateAppDataOnUploadQueueParams) => void,
  removePending: (params: AppDataKeyParams) => void
) {
  const { fullAppData, appDataKeccak256, chainId, orderId, failedAttempts, env } = appDataRecord

  if (!fullAppData || !appDataKeccak256) return

  // Update state to prevent it to be uploaded by another process in the meantime
  updatePending({ chainId, orderId, uploading: true })

  try {
    await uploadAppDataDocOrderbookApi({ appDataKeccak256, fullAppData, chainId, env })
    removePending({ chainId, orderId })
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(`[UploadToIpfsUpdater] Failed to upload doc, will try again. Reason: ${e.message}`, e, fullAppData)
    updatePending({ chainId, orderId, uploading: false, failedAttempts: failedAttempts + 1, lastAttempt: Date.now() })
  }
}
