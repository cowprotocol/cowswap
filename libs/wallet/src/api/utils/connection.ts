import { isMobile } from '@cowprotocol/common-utils'

import { patchProviderLogging } from '../../wagmi/debugProviderLogger'
import { guardMobileInjectedProvider } from '../../wagmi/mobileInjectedProviderGuard'

import type { EIP1193Provider } from 'viem'

type WindowWithInjectedProvider = {
  ethereum?: unknown
}

export function getInjectedProvider(targetWindow?: WindowWithInjectedProvider): EIP1193Provider | undefined {
  try {
    const ethereumWindow = targetWindow ?? (typeof window === 'undefined' ? undefined : window)
    const provider = guardMobileInjectedProvider(ethereumWindow?.ethereum as EIP1193Provider | undefined)

    // DEBUG-ONLY: log every RPC request to find the hanging call on MetaMask iOS.
    return patchProviderLogging(provider)
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
