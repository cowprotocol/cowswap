import { useAtomValue, useUpdateAtom } from 'jotai/utils'

import { DEFAULT_APP_CODE, SAFE_APP_CODE } from 'legacy/constants'

import { useIsSafeApp } from 'modules/wallet'

import { addAppDataToUploadQueueAtom, appDataInfoAtom } from './state/atoms'
import { AppDataInfo } from './types'

const APP_CODE = process.env.REACT_APP_APP_CODE

export function useUploadAppData() {
  return useUpdateAtom(addAppDataToUploadQueueAtom)
}

export function useAppData(): AppDataInfo | null {
  return useAtomValue(appDataInfoAtom)
}

export function useAppCode(): string {
  const isSafeApp = useIsSafeApp()

  if (APP_CODE) {
    // appCode coming from env var has priority
    return APP_CODE
  }

  return isSafeApp ? SAFE_APP_CODE : DEFAULT_APP_CODE
}
