import { useAtomValue } from 'jotai'
import { QueuePriority, tokenSubscriptionQueuesAtom } from '../state/tokenSubscriptionQueues'
import { useWalletInfo } from '@cow/modules/wallet'
import ms from 'ms.macro'
import { isSupportedChainIdType } from '@src/custom/lib/hooks/routing/clientSideSmartOrderRouter'
import { useMemo } from 'react'

const UPDATE_TIME_MILLISECONDS: Record<QueuePriority, number> = {
  highPrio: ms`15`,
  mediumPrio: ms`1min`,
  lowPrio: ms`5min`,
}

const ALL_PRIOS = Object.keys(UPDATE_TIME_MILLISECONDS) as QueuePriority[]

function useTokensWithSubscriptions() {
  const { account, chainId } = useWalletInfo()
  const tokenSubscriptionQueues = useAtomValue(tokenSubscriptionQueuesAtom)

  return useMemo(() => {
    if (!account || !chainId || !isSupportedChainIdType(chainId)) {
      return []
    }

    const subscriptionByAccount = tokenSubscriptionQueues[account]
    const tokensWithSubscription = ALL_PRIOS.reduce<Record<QueuePriority, string[]>>(
      (acc, prio) => {
        const queueByPrio = subscriptionByAccount[prio]
        const queue = queueByPrio[chainId]

        const addresses = Array.from(queue.entries())
          .filter(([, referenceCount]) => referenceCount > 0)
          .map(([address]) => address)

        acc[prio] = addresses

        return acc
      },
      {
        highPrio: [],
        mediumPrio: [],
        lowPrio: [],
      }
    )

    return tokensWithSubscription
  }, [tokenSubscriptionQueues, account, chainId])
}

export function TokenBalancesUpdater() {
  // TODO: Update the balances for the tokens in the quee
  const tokensWithSubscription = useTokensWithSubscriptions()
  console.log('[TokenBalancesUpdater] tokensWithSubscription', tokensWithSubscription)
  return null
}
