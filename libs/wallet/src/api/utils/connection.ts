import { isMobile } from '@cowprotocol/common-utils'

import { guardMobileInjectedProvider } from '../../wagmi/mobileInjectedProviderGuard'

import type { EIP1193Provider } from 'viem'

type WindowWithInjectedProvider = {
  ethereum?: unknown
}

export function getInjectedProvider(targetWindow?: WindowWithInjectedProvider): EIP1193Provider | undefined {
  try {
    const ethereumWindow = targetWindow ?? (typeof window === 'undefined' ? undefined : window)

    return guardMobileInjectedProvider(ethereumWindow?.ethereum as EIP1193Provider | undefined)
  } catch {
    return undefined
  }
}

export function getIsInjected(): boolean {
  return Boolean(getInjectedProvider())
}

export function getIsInjectedMobileBrowser(): boolean {
  return getIsInjected() && isMobile
}
