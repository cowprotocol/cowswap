import { isCoinbaseWalletBrowser, isMobile, userAgent } from '@cowprotocol/common-utils'

export function isIosExternalBrowser(): boolean {
  return isMobile && userAgent.os?.name === 'iOS' && !isCoinbaseWalletBrowser
}
