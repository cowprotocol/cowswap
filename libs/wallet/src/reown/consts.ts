import { VIEM_CHAINS } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS } from '@cowprotocol/cow-sdk'

import { type Chain } from 'viem/chains'

export const SUPPORTED_REOWN_NETWORKS = ALL_SUPPORTED_CHAIN_IDS.map((chainId) => VIEM_CHAINS[chainId]) as [
  Chain,
  ...Chain[],
]

export const COW_WIDGET_CONNECTOR_ID = 'cow-widget'
