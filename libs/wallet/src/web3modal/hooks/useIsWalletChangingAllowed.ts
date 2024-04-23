import { useIsSafeApp } from './useWalletMetadata'

export function useIsWalletChangingAllowed(): boolean {
  const isSafeApp = useIsSafeApp()

  return !isSafeApp
}
