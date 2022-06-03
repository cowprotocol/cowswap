import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { AppDataDoc, SupportedChainId } from '@cowprotocol/cow-sdk'
import ms from 'ms.macro'

import { filterUpdatableAtom, removePendingAtom, updatePendingAtom } from 'state/appData/atoms'
import { COW_SDK } from 'constants/index'

export function UploadToIpfsUpdater(): null {
  const toUpload = useAtomValue(filterUpdatableAtom)
  const removePending = useSetAtom(removePendingAtom)
  const updatePending = useSetAtom(updatePendingAtom)

  const refToUpload = useRef(toUpload)
  refToUpload.current = toUpload

  useEffect(() => {
    async function handle() {
      console.debug(`uploadToIpfs/ starting to iterate over pending`, refToUpload.current.length, refToUpload.current)
      refToUpload.current.forEach(({ chainId, orderId, doc, tryAfter, uploading }) => {
        if (doc && !uploading && (!tryAfter || tryAfter <= Date.now())) {
          updatePending({ chainId, orderId, uploading: true })
          _uploadToIpfs(
            doc,
            chainId,
            () => removePending({ chainId, orderId }),
            () => updatePending({ chainId, orderId, uploading: false, tryAfter: Date.now() + ms`30s` })
          )
        } else {
          removePending({ chainId, orderId })
        }
      })
    }

    const timer = setInterval(handle, ms`10s`)

    return () => {
      clearInterval(timer)
    }
  }, [removePending, updatePending])

  return null
}

async function _uploadToIpfs(
  doc: AppDataDoc,
  chainId: SupportedChainId,
  onSuccess: () => void,
  onFailure: () => void
): Promise<void> {
  const sdk = COW_SDK[chainId]

  try {
    const appDataHash = await sdk.metadataApi.uploadMetadataDocToIpfs(doc)
    console.debug(`uploadToIpfs/ uploaded ${appDataHash}`, JSON.stringify(doc))
    onSuccess()
  } catch (e) {
    console.debug(`uploadToIpfs/ failed to upload`, JSON.stringify(doc), e.message)
    onFailure()
  }
}
