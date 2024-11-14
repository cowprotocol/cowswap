import { useSetupSwapAmountsFromUrl } from '../hooks/useSetupSwapAmountsFromUrl'

export function SwapAmountsFromUrlUpdater({ allowSameToken }: { allowSameToken: boolean }) {
  useSetupSwapAmountsFromUrl({ allowSameToken })
  return null
}
