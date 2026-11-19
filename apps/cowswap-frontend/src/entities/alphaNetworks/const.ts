import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Networks released to opted-in users ahead of their public launch. Empty between slow releases:
 * a launched network graduates off this list rather than keeping a flag behind.
 */
export const ALPHA_NETWORK_IDS: readonly SupportedChainId[] = []

export const ARE_ALPHA_NETWORKS_OFFERED = ALPHA_NETWORK_IDS.length > 0
