import BungeeLogo from '@cowprotocol/assets/images/bungee-logo.svg'

import { BridgeProtocolConfig } from './types'

/**
 * Enum of supported bridge providers
 */
export enum BridgeProvider {
  BUNGEE = 'BUNGEE',
}

/**
 * Type for the bridge provider details map
 */
export type BridgeProviderDetailsMap = Record<BridgeProvider, BridgeProtocolConfig>

/**
 * Registry of bridge provider details
 */
export const BRIDGE_PROVIDER_DETAILS: BridgeProviderDetailsMap = {
  [BridgeProvider.BUNGEE]: {
    icon: BungeeLogo,
    title: 'Bungee Exchange',
    url: 'https://bungee.exchange',
    description: 'Multi-chain bridge and swap protocol',
  },
}

/**
 * Returns bridge provider details for a given provider
 * @param provider - BridgeProvider enum value
 * @returns The provider details
 */
export function getBridgeProviderDetails(provider: BridgeProvider): BridgeProtocolConfig | undefined {
  return BRIDGE_PROVIDER_DETAILS[provider]
}

/**
 * Array of all bridge provider details
 */
export const BRIDGE_PROVIDER_DETAILS_ARRAY: BridgeProtocolConfig[] = Object.values(BRIDGE_PROVIDER_DETAILS)
