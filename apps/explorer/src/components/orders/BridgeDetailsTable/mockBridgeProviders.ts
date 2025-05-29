import BungeeLogo from '@cowprotocol/assets/images/bungee-logo.svg'
import { BridgeProtocolConfig } from '@cowprotocol/bridge'

/**
 * Enum of supported bridge providers (mock data for explorer)
 */
export enum BridgeProvider {
  BUNGEE = 'BUNGEE',
}

/**
 * Type for the bridge provider details map
 */
export type BridgeProviderDetailsMap = Record<BridgeProvider, BridgeProtocolConfig>

/**
 * Mock registry of bridge provider details for explorer display
 * TODO: Replace with real data from SDK in production
 */
export const MOCK_BRIDGE_PROVIDER_DETAILS: BridgeProviderDetailsMap = {
  [BridgeProvider.BUNGEE]: {
    icon: BungeeLogo,
    title: 'Bungee Exchange',
    url: 'https://bungee.exchange',
    description: 'Multi-chain bridge and swap protocol',
  },
}

/**
 * Returns mock bridge provider details for a given provider
 * TODO: Replace with SDK call in production
 * @param provider - BridgeProvider enum value
 * @returns The provider details
 */
export function getMockBridgeProviderDetails(provider: BridgeProvider): BridgeProtocolConfig | undefined {
  return MOCK_BRIDGE_PROVIDER_DETAILS[provider]
}

/**
 * Array of all mock bridge provider details
 */
export const MOCK_BRIDGE_PROVIDER_DETAILS_ARRAY: BridgeProtocolConfig[] = Object.values(MOCK_BRIDGE_PROVIDER_DETAILS)
