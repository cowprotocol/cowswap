import { msg } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { BulletListItem } from 'modules/trade/pure/UnlockWidgetScreen'

export const LIMIT_BULLET_LIST_CONTENT: BulletListItem[] = [
  { content: msg`Set any limit price and time horizon` },
  { content: msg`FREE order placement and cancellation` },
  { content: msg`Place multiple orders using the same balance` },
  { content: msg`Receive surplus of your order` },
  { content: msg`Protection from MEV by default` },
  {
    content: (
      <span>
        <Trans>Place orders for higher than available balance!</Trans>
      </span>
    ),
  },
]

export const UNLOCK_SCREEN = {
  title: msg`Want to try out limit orders?`,
  subtitle: msg`Get started!`,
  orderType: msg`partially fillable`,
  buttonText: msg`Get started with limit orders`,
  buttonLink: 'https://cow.fi/learn/cow-swap-improves-the-limit-order-experience-with-partially-fillable-limit-orders',
}
