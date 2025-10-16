import { ReactNode } from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { AffectedPermitOrdersTable } from 'modules/ordersTable'

import { AccordionBanner } from 'common/pure/AccordionBanner'
import { doesOrderHavePermit } from 'common/utils/doesOrderHavePermit'

import * as styledEl from './styled'

type ActiveOrdersWithAffectedPermitProps = {
  currency: Currency
  orderId?: string
}

export function ActiveOrdersWithAffectedPermit({ currency, orderId }: ActiveOrdersWithAffectedPermitProps): ReactNode {
  const { chainId, account } = useWalletInfo()
  const pendingOrders = useOnlyPendingOrders(chainId, account)

  const ordersWithPermit = pendingOrders.filter((order) => {
    return order.id !== orderId && currency.equals(order.inputToken) && doesOrderHavePermit(order)
  })

  if (!ordersWithPermit.length) return null

  const ordersWithPermitLenght = ordersWithPermit.length

  const titleContent = (
    <Trans>
      Partial approval may block <span className={'font-bold'}>{ordersWithPermitLenght}</span> other orders
    </Trans>
  )

  return (
    <AccordionBanner title={titleContent} accordionPadding={'9px 6px'}>
      <styledEl.DropdownList>
        <AffectedPermitOrdersTable orders={ordersWithPermit} />
      </styledEl.DropdownList>
      <styledEl.DropdownFooter>
        <Trans>
          There are <span className={'font-bold'}>{ordersWithPermitLenght}</span> existing orders using a{' '}
          <TokenSymbol className={'font-bold'} token={currency} /> token approval. If you sign a new one, only one order
          can fill. Continue with current permit amount or choose full approval so all orders can be filled.
        </Trans>
      </styledEl.DropdownFooter>
    </AccordionBanner>
  )
}
