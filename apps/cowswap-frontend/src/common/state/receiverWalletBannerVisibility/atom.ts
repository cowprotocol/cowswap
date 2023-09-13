import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type WarningBannerVisibility = string[]

const WARNING_BANNER_VISIBILITY_KEY = 'warningBannerVisibility:v0'

export const hiddenReceiverWalletBannersAtom = atomWithStorage<WarningBannerVisibility>(
  WARNING_BANNER_VISIBILITY_KEY,
  []
)

export const hideReceiverWalletBannerAtom = atom(null, (get, set, orderId: string) => {
  const hiddenBanners = get(hiddenReceiverWalletBannersAtom)

  if (hiddenBanners.includes(orderId)) {
    return
  }

  set(hiddenReceiverWalletBannersAtom, [...hiddenBanners, orderId])
})
