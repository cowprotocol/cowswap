import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { hiddenReceiverWalletBannersAtom, hideReceiverWalletBannerAtom } from './atom'

export function useIsReceiverWalletBannerHidden(orderId?: string): boolean {
  const hiddenBanners = useAtomValue(hiddenReceiverWalletBannersAtom)

  return useMemo(() => !!orderId && hiddenBanners.includes(orderId), [hiddenBanners, orderId])
}

export function useHideReceiverWalletBanner() {
  return useSetAtom(hideReceiverWalletBannerAtom)
}
