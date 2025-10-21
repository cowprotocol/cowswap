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

  const isMultiple = ordersWithPermit.length > 1
  const titleContent = (
    <>
     Partial approval may block{' '}
     <span className="font-bold">
      {ordersWithPermit.length}
     </span>{' '}
     other order{isMultiple ? 's' : ''}.
    </>
  )

return (
  <AccordionBanner title={titleContent} accordionPadding="9px 6px">
    <styledEl.DropdownList>
      <AffectedPermitOrdersTable orders={ordersWithPermit} />
    </styledEl.DropdownList>

    <styledEl.DropdownFooter>
      There {isMultiple ? 'are' : 'is'}{' '}
      <span className="font-bold">{ordersWithPermit.length}</span>{' '}
      existing order{isMultiple ? 's' : ''} using a{' '}
      <TokenSymbol className="font-bold" token={currency} /> token approval. 
      If you sign a new one, only one order can fill. Continue with the current 
      permit amount or choose full approval so all order{isMultiple ? 's' : ''} 
      can be filled.
    </styledEl.DropdownFooter>
  </AccordionBanner>
  )
