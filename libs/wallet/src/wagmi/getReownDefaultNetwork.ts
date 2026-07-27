import { IS_SOLANA_ENABLED, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getLocalStorageItem, getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { EvmChains, isEvmChain, isSolanaChain } from '@cowprotocol/cow-sdk'

import { solana } from '@reown/appkit/networks'

import { wagmiStorage } from '../wagmiStorage'

import type { AppKitNetwork } from '@reown/appkit-common'

// AppKit persists the last connected connector per namespace under these keys.
const APPKIT_EVM_CONNECTOR_KEY = '@appkit/eip155:connected_connector_id'
const APPKIT_SOLANA_CONNECTOR_KEY = '@appkit/solana:connected_connector_id'
// AppKit persists the last *active* chain namespace here (`'eip155'` | `'solana'`).
const APPKIT_ACTIVE_NAMESPACE_KEY = '@appkit/active_namespace'
const SOLANA_NAMESPACE = 'solana'

export function getReownDefaultNetwork(): AppKitNetwork {
  const urlChainId = getRawCurrentChainIdFromUrl()

  // The URL explicitly names a chain (e.g. /137/swap) → honor it.
  if (urlChainId !== null) {
    if (IS_SOLANA_ENABLED && isSolanaChain(urlChainId)) return solana
    if (isEvmChain(urlChainId)) return VIEM_CHAINS[urlChainId]
  }

  // No chain in the URL (e.g. /account): fall back to the previously connected wallet.
  // Booting AppKit in the wrong namespace drops the persisted session on refresh, so we
  // pick the default network from the connector that is actually connected — NOT from the
  // `active_namespace` pointer alone, which can read `'solana'` for an EVM user (stale, or
  // both wallets connected) and would wrongly boot eip155 users into the Solana namespace.
  if (IS_SOLANA_ENABLED && shouldDefaultToSolana()) {
    return solana
  }

  return VIEM_CHAINS[EvmChains.MAINNET]
}

// Mirrors the EVM reconnect signal used in `config.ts`: wagmi's own `recentConnectorId` is the
// source of truth, but AppKit's connector key is also checked to cover both restore paths.
function hasEvmConnection(): boolean {
  return Boolean(
    getLocalStorageItem(`${wagmiStorage.key}.recentConnectorId`) || getLocalStorageItem(APPKIT_EVM_CONNECTOR_KEY),
  )
}

function shouldDefaultToSolana(): boolean {
  // No Solana wallet to restore → never default to Solana.
  if (!getLocalStorageItem(APPKIT_SOLANA_CONNECTOR_KEY)) return false
  // Solana is the only connected wallet → default to Solana.
  if (!hasEvmConnection()) return true
  // Both namespaces are connected → honor whichever was last active.
  return getLocalStorageItem(APPKIT_ACTIVE_NAMESPACE_KEY) === SOLANA_NAMESPACE
}
