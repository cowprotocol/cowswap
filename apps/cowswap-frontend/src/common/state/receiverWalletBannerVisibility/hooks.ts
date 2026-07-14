import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { hiddenReceiverWalletBannersAtom, hideReceiverWalletBannerAtom } from './atom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useHideReceiverWalletBanner() {
  return useSetAtom(hideReceiverWalletBannerAtom)
}

export function useIsReceiverWalletBannerHidden(orderId?: string): boolean {
  const hiddenBanners = useAtomValue(hiddenReceiverWalletBannersAtom)

  return useMemo(() => !!orderId && hiddenBanners.includes(orderId), [hiddenBanners, orderId])
}
