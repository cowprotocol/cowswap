import { isTwapEventId } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { eoaTwapOrdersAtom } from 'entities/twap'

export async function waitForTwapEventId(hash: string, owner: string, chainId: number): Promise<string | undefined> {
  let unsubscribe = (): void => undefined

  try {
    return await new Promise<string | undefined>((resolve) => {
      const timeout = setTimeout(() => resolve(undefined), 30_000)
      const check = (): void => {
        const order = Object.values(jotaiStore.get(eoaTwapOrdersAtom)).find(
          (order) =>
            order.hash === hash &&
            order.chainId === chainId &&
            areAddressesEqual(order.resolvedOwner, owner) &&
            isTwapEventId(order.id),
        )
        if (order) {
          clearTimeout(timeout)
          resolve(order.id)
        }
      }

      unsubscribe = jotaiStore.sub(eoaTwapOrdersAtom, check)
      check()
    })
  } finally {
    unsubscribe()
  }
}
