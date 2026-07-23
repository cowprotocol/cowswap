import { IS_SOLANA_ENABLED, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { EvmChains, isEvmChain, isSolanaChain } from '@cowprotocol/cow-sdk'

import { solana } from '@reown/appkit/networks'

import type { AppKitNetwork } from '@reown/appkit-common'

// AppKit persists the last connected chain namespace here (`'eip155'` | `'solana'`).
const APPKIT_ACTIVE_NAMESPACE_KEY = '@appkit/active_namespace'
const SOLANA_NAMESPACE = 'solana'

export function getReownDefaultNetwork(): AppKitNetwork {
  const urlChainId = getRawCurrentChainIdFromUrl()

  // The URL explicitly names a chain (e.g. /137/swap) → honor it.
  if (urlChainId !== null) {
    if (IS_SOLANA_ENABLED && isSolanaChain(urlChainId)) return solana
    if (isEvmChain(urlChainId)) return VIEM_CHAINS[urlChainId]
  }

  // No chain in the URL (e.g. /account): fall back to the last connected namespace.
  // Without this, a Solana wallet gets the EVM default, which boots AppKit in the
  // eip155 namespace and drops the Solana session on refresh.
  if (IS_SOLANA_ENABLED && getLastActiveNamespace() === SOLANA_NAMESPACE) {
    return solana
  }

  return VIEM_CHAINS[EvmChains.MAINNET]
}

function getLastActiveNamespace(): string | null {
  if (typeof localStorage === 'undefined') return null

  return localStorage.getItem(APPKIT_ACTIVE_NAMESPACE_KEY)
}
