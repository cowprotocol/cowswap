import { ReactNode } from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

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

  const isPlural = ordersWithPermit.length > 1
  const orderWord = isPlural ? 'orders' : 'order'

  const titleContent = (
    <>
      Partial approval may block <span className={'font-bold'}>{ordersWithPermit.length}</span> other {orderWord}.
    </>
  )

  return (
    <AccordionBanner title={titleContent} accordionPadding={'9px 6px'}>
      <styledEl.DropdownList>
        <AffectedPermitOrdersTable orders={ordersWithPermit} />
      </styledEl.DropdownList>
      <styledEl.DropdownFooter>
        There {isPlural ? 'are' : 'is'} <span className={'font-bold'}>{ordersWithPermit.length}</span> existing{' '}
        {orderWord} using a <TokenSymbol className={'font-bold'} token={currency} /> token approval. Partial approval  
        may affect the execution of other orders. Adjust the amount or choose full approval to proceed.
      </styledEl.DropdownFooter>
    </AccordionBanner>
  )
}
