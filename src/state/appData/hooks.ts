import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { addAppDataToUploadQueueAtom } from 'state/appData/atoms'
import { AppDataInfo } from 'state/appData/types'

export function useAddAppDataToUploadQueue(chainId: SupportedChainId | undefined, appData: AppDataInfo | null) {
  const addAppDataToUploadQueue = useUpdateAtom(addAppDataToUploadQueueAtom)

  return useCallback(
    (orderId: string) => {
      if (!chainId || !appData) return
      addAppDataToUploadQueue({ chainId, orderId, appData })
    },
    [appData, chainId, addAppDataToUploadQueue]
  )
}
