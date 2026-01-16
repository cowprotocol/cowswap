import { SORTED_CHAIN_IDS } from '@cowprotocol/common-const'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

const CHAIN_ORDER = SORTED_CHAIN_IDS.reduce<Record<SupportedChainId, number>>(
  (acc, chainId, index) => {
    acc[chainId] = index
    return acc
  },
  {} as Record<SupportedChainId, number>,
)

interface SortOptions {
  pinChainId?: ChainInfo['id']
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
    weight: CHAIN_ORDER[chain.id as SupportedChainId] ?? Number.MAX_SAFE_INTEGER,
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
