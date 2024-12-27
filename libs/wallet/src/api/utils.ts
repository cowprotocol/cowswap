import { isMobile } from '@cowprotocol/common-utils'

export function getIsInjected(): boolean {
  return Boolean(window.ethereum)
}

export function getIsInjectedMobileBrowser(): boolean {
  return getIsInjected() && isMobile
}
