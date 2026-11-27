import { atom } from 'jotai'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { twapOrdersListAtom } from 'entities/twap'
import { atomEffect } from 'jotai-effect'

import { TWAP_FINAL_STATUSES } from '../const'
import { TwapOrderStatus } from '../types'
import { triggerTwapAppziSurvey, TwapAppziSurveyEvent } from '../utils/triggerTwapAppziSurvey.utils'

const previousTwapSurveyOrdersAtom = atom<{ context: string; statuses: Record<string, TwapOrderStatus> }>({
  context: '',
  statuses: {},
})

export const twapAppziSurveyEffectAtom = atomEffect((get, set) => {
  const { account, chainId } = get(walletInfoAtom)
  const orders = get(twapOrdersListAtom)
  const context = account && chainId ? `${getAddressKey(account)}:${chainId}` : ''
  const previous = get.peek(previousTwapSurveyOrdersAtom)

  set(previousTwapSurveyOrdersAtom, {
    context,
    statuses: Object.fromEntries(orders.map(({ id, status }) => [id, status])),
  })

  if (!context || context !== previous.context) return

  for (const order of orders) {
    const previousStatus = previous.statuses[order.id] ?? (order.hash ? previous.statuses[order.hash] : undefined)
    const event = getTwapSurveyEvent(previousStatus, order.status)

    if (event) {
      triggerTwapAppziSurvey(order, event, orders)
      break
    }
  }
})

function getTwapSurveyEvent(
  previousStatus: TwapOrderStatus | undefined,
  status: TwapOrderStatus,
): TwapAppziSurveyEvent | undefined {
  if (previousStatus === undefined || previousStatus === status || TWAP_FINAL_STATUSES.includes(previousStatus)) {
    return
  }

  if (previousStatus === TwapOrderStatus.WaitSigning && status === TwapOrderStatus.Pending) return { created: true }
  if (status === TwapOrderStatus.Fulfilled) return { traded: true }
  if (status === TwapOrderStatus.Expired || status === TwapOrderStatus.PartiallyFilled) return { expired: true }
  if (status === TwapOrderStatus.Cancelled) return { cancelled: true }

  return
}
