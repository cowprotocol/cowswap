import { createStorage } from 'wagmi'

import { WALLET_STORAGE_KEY } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { COW_WIDGET_CONNECTOR_ID } from './reown/consts'
import { getIsSafeAppIframe } from './utils/getIsSafeAppIframe'

const safeSuffix = getIsSafeAppIframe() ? '_safe-app' : ''
/**
 * Variants:
 *  - swap.cow.fi, not iframe: cowswap-wallet
 *  - swap.cow.fi, widget, not safe: cowswap-wallet-cow-widget
 *  - swap.cow.fi, widget, safe: cowswap-wallet-cow-widget_safe-app
 *  - swap.cow.fi, safe: cowswap-wallet_safe-app
 */
export const WAGMI_STORAGE_KEY = isInjectedWidget()
  ? WALLET_STORAGE_KEY + '-' + COW_WIDGET_CONNECTOR_ID + safeSuffix
  : WALLET_STORAGE_KEY + safeSuffix

export const wagmiStorage = createStorage({
  key: WAGMI_STORAGE_KEY,
  storage: localStorage,
})
