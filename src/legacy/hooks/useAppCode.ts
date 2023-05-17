import { useIsSafeApp } from '@cow/modules/wallet'
import { DEFAULT_APP_CODE, SAFE_APP_CODE } from 'constants/index'

const APP_CODE = process.env.REACT_APP_APP_CODE

export function useAppCode(): string {
  const isSafeApp = useIsSafeApp()

  if (APP_CODE) {
    // appCode coming from env var has priority
    return APP_CODE
  }

  return isSafeApp ? SAFE_APP_CODE : DEFAULT_APP_CODE
}
