import { VIEM_CHAINS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { type Chain } from 'viem/chains'

const SUPPORTED_CHAIN_IDS = Object.values(SupportedChainId).filter((v) => typeof v === 'number')

export const SUPPORTED_REOWN_NETWORKS = SUPPORTED_CHAIN_IDS.map((chainId) => VIEM_CHAINS[chainId]) as [
  Chain,
  ...Chain[],
]
