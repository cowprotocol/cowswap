import { atom } from 'jotai'
import { AppDataDoc, SupportedChainId } from '@cowprotocol/cow-sdk'

import { atomWithStorage, useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

export const appDataInfoAtom = atom<AppDataInfo | null>(null)

export type AppDataInfo = {
  doc?: AppDataDoc // in case of default hash, there's no doc
  hash: string
}
type FlowControl = {
  tryAfter?: number
  uploading: boolean
}
export type AppDataRecord = AppDataInfo & FlowControl
export type AppDataDocsPendingToUpload = Record<SupportedChainId, Record<string, AppDataRecord>>

type AddPendingAppDataDocParams = {
  chainId: SupportedChainId
  orderId: string
  appData: AppDataInfo
}

const INITIAL_APP_DATA_DOC_PENDING_TO_UPLOAD: AppDataDocsPendingToUpload = {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.RINKEBY]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
}

export const pendingUploadAppDataDocsAtom = atomWithStorage(
  'pendingUploadAppDataDocs',
  INITIAL_APP_DATA_DOC_PENDING_TO_UPLOAD
)
export const addPendingAtom = atom(null, (get, set, { chainId, orderId, appData }: AddPendingAppDataDocParams) => {
  set(pendingUploadAppDataDocsAtom, () => {
    const docs = get(pendingUploadAppDataDocsAtom)
    console.debug(`atoms/add`, chainId, orderId, appData)
    return {
      ...docs,
      [chainId]: {
        ...docs[chainId],
        [orderId]: { ...appData, uploading: false },
      },
    }
  })
})
export const updatePendingAtom = atom(
  null,
  (get, set, { chainId, orderId, uploading, tryAfter }: Omit<AddPendingAppDataDocParams, 'appData'> & FlowControl) => {
    set(pendingUploadAppDataDocsAtom, () => {
      const docs = get(pendingUploadAppDataDocsAtom)
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

// TODO: clear this type mess
type T = Omit<AddPendingAppDataDocParams, 'appData'> & AppDataRecord
export const filterUpdatableAtom = atom((get) => {
  const docs = get(pendingUploadAppDataDocsAtom)
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
export const removePendingAtom = atom(
  null,
  (get, set, { chainId, orderId }: Omit<AddPendingAppDataDocParams, 'appData'>) => {
    set(pendingUploadAppDataDocsAtom, () => {
      const docs = { ...get(pendingUploadAppDataDocsAtom) }
      console.debug(`atoms/remove`, chainId, orderId)
      delete docs[chainId][orderId]
      return docs
    })
  }
)

export function useAddPendingAppData(chainId: SupportedChainId | undefined, appData: AppDataInfo | null) {
  const _addPendingAppData = useUpdateAtom(addPendingAtom)

  return useCallback(
    (orderId: string) => {
      if (!chainId || !appData) return
      _addPendingAppData({ chainId, orderId, appData })
    },
    [appData, chainId, _addPendingAppData]
  )
}
