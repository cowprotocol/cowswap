import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import ms from 'ms.macro'

import { COW_IPFS_OPTIONS } from 'legacy/constants'

import {
  appDataUploadQueueAtom,
  removeAppDataFromUploadQueueAtom,
  updateAppDataOnUploadQueueAtom,
} from '../state/atoms'
import { AppDataKeyParams, AppDataRecord, UpdateAppDataOnUploadQueueParams } from '../types'
import { metadataApiSDK } from 'cowSdk'

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

async function _uploadToIpfs(
  appDataRecord: AppDataRecord,
  updatePending: (params: UpdateAppDataOnUploadQueueParams) => void,
  removePending: (params: AppDataKeyParams) => void
) {
  const { doc, chainId, orderId, uploading, failedAttempts, lastAttempt } = appDataRecord

  if (!doc) {
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

async function _actuallyUploadToIpfs(
  appDataRecord: AppDataRecord,
  updatePending: (params: UpdateAppDataOnUploadQueueParams) => void,
  removePending: (params: AppDataKeyParams) => void
) {
  const { doc, chainId, orderId, failedAttempts, hash } = appDataRecord

  if (!doc) return

  // Update state to prevent it to be uploaded by another process in the meantime
  updatePending({ chainId, orderId, uploading: true })

  try {
    const actualHash = await metadataApiSDK.uploadMetadataDocToIpfs(doc, COW_IPFS_OPTIONS)

    removePending({ chainId, orderId })

    if (hash !== actualHash) {
      // TODO: add sentry error to track hard failure
      console.error(
        `[UploadToIpfsUpdater] Uploaded data hash (${actualHash}) differs from calculated (${hash}) for doc`,
        JSON.stringify(doc)
      )
    } else {
      console.debug(`[UploadToIpfsUpdater] Uploaded doc with hash ${actualHash}`, JSON.stringify(doc))
    }
  } catch (e: any) {
    // TODO: add sentry error to track soft failure
    console.warn(
      `[UploadToIpfsUpdater] Failed to upload doc, will try again. Reason: ${e.message}`,
      JSON.stringify(doc)
    )
    updatePending({ chainId, orderId, uploading: false, failedAttempts: failedAttempts + 1, lastAttempt: Date.now() })
  }
}
