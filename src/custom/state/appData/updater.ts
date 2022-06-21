import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import ms from 'ms.macro'

import { COW_SDK } from 'constants/index'

import {
  flattenedAppDataFromUploadQueueAtom,
  removeAppDataFromUploadQueueAtom,
  updateAppDataOnUploadQueueAtom,
} from 'state/appData/atoms'
import {
  AppDataKeyParams,
  FlattenedAppDataFromUploadQueue,
  UpdateAppDataOnUploadQueueParams,
} from 'state/appData/types'

const UPLOAD_CHECK_INTERVAL = ms`10s`
const BASE_TIME_BETWEEN_ATTEMPTS = 2 // in seconds, converted to milliseconds later
const ONE_SECOND = ms`1s`
const MAX_TIME_TO_WAIT = ms`5 minutes`

export function UploadToIpfsUpdater(): null {
  const toUpload = useAtomValue(flattenedAppDataFromUploadQueueAtom)
  const removePending = useSetAtom(removeAppDataFromUploadQueueAtom)
  const updatePending = useSetAtom(updateAppDataOnUploadQueueAtom)

  // Storing a reference to avoid re-render on every update
  const refToUpload = useRef(toUpload)
  refToUpload.current = toUpload

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
  appDataRecord: FlattenedAppDataFromUploadQueue,
  updatePending: (params: UpdateAppDataOnUploadQueueParams) => void,
  removePending: (params: AppDataKeyParams) => void
) {
  const { doc, chainId, orderId, uploading, failedAttempts, lastAttempt, hash } = appDataRecord

  if (!doc) {
    // No actual doc to upload, nothing to do here
    removePending({ chainId, orderId })
  } else if (_canUpload(uploading, failedAttempts, lastAttempt)) {
    // Update state to prevent it to be uploaded by another process in the meantime
    updatePending({ chainId, orderId, uploading: true })

    try {
      const sdk = COW_SDK[chainId]

      const actualHash = await sdk.metadataApi.uploadMetadataDocToIpfs(doc)

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
    } catch (e) {
      // TODO: add sentry error to track soft failure
      console.debug(`[UploadToIpfsUpdater] Failed to upload doc, will try again`, JSON.stringify(doc))
      updatePending({ chainId, orderId, uploading: false, failedAttempts: failedAttempts + 1, lastAttempt: Date.now() })
    }
  }
}

function _canUpload(uploading: boolean, attempts: number, lastAttempt?: number): boolean {
  if (uploading) {
    return false
  }

  if (lastAttempt) {
    // Every attempt takes BASE_TIME_BETWEEN_ATTEMPTS ˆ failedAttempts
    const timeToWait = BASE_TIME_BETWEEN_ATTEMPTS ** attempts * ONE_SECOND
    // Don't wait more than MAX_TIME_TO_WAIT.
    // Both are in milliseconds
    const timeDelta = Math.min(timeToWait, MAX_TIME_TO_WAIT)

    return lastAttempt + timeDelta <= Date.now()
  }

  return true
}
