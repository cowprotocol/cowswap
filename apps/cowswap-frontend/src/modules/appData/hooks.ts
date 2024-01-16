import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { DEFAULT_APP_CODE, SAFE_APP_CODE } from '@cowprotocol/common-const'
import { useIsSafeApp } from '@cowprotocol/wallet'

import { addAppDataToUploadQueueAtom, appDataHooksAtom, appDataInfoAtom } from './state/atoms'
import { AppDataInfo } from './types'

const APP_CODE = process.env.REACT_APP_APP_CODE

export function useAppData(): AppDataInfo | null {
  return useAtomValue(appDataInfoAtom)
}

export function useAppCode(): string | null {
  const isSafeApp = useIsSafeApp()

  return useMemo(() => {
    if (APP_CODE) {
      // appCode coming from env var has priority
      return APP_CODE
    }

    return isSafeApp ? SAFE_APP_CODE : DEFAULT_APP_CODE
  }, [isSafeApp])
}

export function useUploadAppData() {
  return useSetAtom(addAppDataToUploadQueueAtom)
}

export function useUpdateAppDataHooks() {
  return useSetAtom(appDataHooksAtom)
}

export function useAppDataHooks() {
  return useAtomValue(appDataHooksAtom)
}
