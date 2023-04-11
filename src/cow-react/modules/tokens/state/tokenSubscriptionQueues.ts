import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'

import { Token } from '@uniswap/sdk-core'
import { isSupportedChainIdType } from '@src/custom/lib/hooks/routing/clientSideSmartOrderRouter'
export type QueuePriority = 'lowPrio' | 'mediumPrio' | 'highPrio'
export type TokenSubscriptions = Record<SupportedChainId, Map<string, number>>
export type TokenBalanceUpdateQueues = Record<QueuePriority, TokenSubscriptions>

export function initSubscriptions() {
  const createEmptySubscription = (): TokenSubscriptions => ({
    [SupportedChainId.MAINNET]: new Map(),
    [SupportedChainId.GNOSIS_CHAIN]: new Map(),
    [SupportedChainId.GOERLI]: new Map(),
  })

  return {
    lowPrio: createEmptySubscription(),
    mediumPrio: createEmptySubscription(),
    highPrio: createEmptySubscription(),
  }
}

export const tokenSubscriptionQueuesAtom = atom<{ [account: string]: TokenBalanceUpdateQueues }>({})

export interface TokenBalanceSubscription {
  account?: string
  queuePrio: QueuePriority
  tokens?: (Token | null)[] // TODO: Not sure why we need null here, but keeping backward compatibility for now
}

/**
 * Auxiliary function to implement subscriptions and desubscription of token updates
 *
 * @param increment 1 for subscription (to increment one the subscription counter), -1 for desubscription (to decrement 1 the subscription counter)
 *
 * @returns the writable atom
 */
const subscribeUnsubscribeAux = (increment: 1 | -1) =>
  atom(null, (get, set, subscription: TokenBalanceSubscription) => {
    set(tokenSubscriptionQueuesAtom, () => {
      const tokenSubscriptionQueues = get(tokenSubscriptionQueuesAtom)

      const { account, tokens, queuePrio } = subscription
      if (!account) {
        return tokenSubscriptionQueues
      }

      const queuesForAccount = tokenSubscriptionQueues[account] || initSubscriptions()
      const queuesForPrio = queuesForAccount[queuePrio]

      tokens?.forEach((token) => {
        if (!token) {
          return
        }

        if (isSupportedChainIdType(token.chainId)) {
          const { chainId, address } = token
          const queue = queuesForPrio[chainId]

          // Get subscriptions for each token and increment count
          const subscriptionCount = queue.get(address) || 0
          queue.set(address, subscriptionCount + increment)
        }
      })

      return tokenSubscriptionQueues[account]
        ? tokenSubscriptionQueues
        : { ...tokenSubscriptionQueues, [account]: queuesForAccount }
    })
  })

/**
 * Create a subscription for a group of tokens.
 *
 * It will increment the counter in the queue for the right account, priority and chain.
 */
export const subscribeTokensAtom = subscribeUnsubscribeAux(1)

/**
 * Removes a subscription for a group of tokens.
 *
 * It will increment the counter in the queue for the right account, priority and chain.
 */
export const unsubscribeTokensAtom = subscribeUnsubscribeAux(-1)
