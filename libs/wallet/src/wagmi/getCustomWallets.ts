import iconOathWalletSrc from '../api/assets/oathWalletIcon.svg'

import type { createAppKit } from '@reown/appkit/react'

export function getCustomWallets(
  isSafeApp: boolean,
  isWidget: boolean,
  isAndroid: boolean,
): Parameters<typeof createAppKit>[0]['customWallets'] {
  if (isSafeApp || isWidget || isAndroid) return undefined

  return [
    {
      id: 'oath-wallet',
      name: 'Oath Wallet',
      homepage: 'https://oathwallet.org',
      image_url: iconOathWalletSrc,
      mobile_link: 'oathwallet://',
      app_store: 'https://apps.apple.com/app/id6780187283',
    },
  ]
}
