import { SORTED_CHAIN_IDS } from '@cowprotocol/common-const'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import { BITCOIN_CHAIN_ID, SOLANA_CHAIN_ID } from 'common/chains/nonEvm'

const CHAIN_ORDER = SORTED_CHAIN_IDS.reduce<Record<SupportedChainId, number>>(
  (acc, chainId, index) => {
    acc[chainId] = index
    return acc
  },
  {} as Record<SupportedChainId, number>,
)

const ARBITRUM_WEIGHT = CHAIN_ORDER[SupportedChainId.ARBITRUM_ONE]

const NON_EVM_CHAIN_ORDER: Record<number, number> = {
  // Place non-EVM destinations directly after Arbitrum in the selector.
  [BITCOIN_CHAIN_ID]: ARBITRUM_WEIGHT + 0.1,
  [SOLANA_CHAIN_ID]: ARBITRUM_WEIGHT + 0.2,
}

interface SortOptions {
  pinChainId?: ChainInfo['id']
}

function getChainWeight(chainId: number): number {
  const evmWeight = CHAIN_ORDER[chainId as SupportedChainId]
  if (typeof evmWeight === 'number') return evmWeight

  const nonEvmWeight = NON_EVM_CHAIN_ORDER[chainId]
  if (typeof nonEvmWeight === 'number') return nonEvmWeight

  return Number.MAX_SAFE_INTEGER
}

/**
 * Sorts a list of chains so it matches the canonical network selector order.
 * Optionally promotes the provided `pinChainId` to the first position.
 */
export function sortChainsByDisplayOrder(chains: ChainInfo[], options?: SortOptions): ChainInfo[] {
  if (chains.length <= 1) {
    return chains.slice()
  }

  const weightedChains = chains.map((chain, index) => ({
    chain,
    weight: getChainWeight(chain.id),
    index,
  }))

  weightedChains.sort((a, b) => {
    if (a.weight === b.weight) {
      return a.index - b.index
    }

    return a.weight - b.weight
  })

  const orderedChains = weightedChains.map((entry) => entry.chain)

  if (!options?.pinChainId) {
    return orderedChains
  }

  const pinIndex = orderedChains.findIndex((chain) => chain.id === options.pinChainId)

  if (pinIndex <= 0) {
    return orderedChains
  }

  const [pinnedChain] = orderedChains.splice(pinIndex, 1)
  orderedChains.unshift(pinnedChain)

  return orderedChains
}
