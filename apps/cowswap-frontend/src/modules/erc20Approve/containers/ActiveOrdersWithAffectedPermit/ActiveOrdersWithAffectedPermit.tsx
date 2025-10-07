import { ReactNode } from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { AffectedPermitOrdersTable } from 'modules/ordersTable'

import { AccordionBanner } from 'common/pure/AccordionBanner'
import { doesOrderHavePermit } from 'common/utils/doesOrderHavePermit'

import * as styledEl from './styled'

export function ActiveOrdersWithAffectedPermit({ currency }: { currency: Currency }): ReactNode {
  const { chainId, account } = useWalletInfo()
  const pendingOrders = useOnlyPendingOrders(chainId, account)

  const ordersWithPermit = pendingOrders.filter((order) => {
    // need to check for buy order
    return currency.equals(order.inputToken) && doesOrderHavePermit(order)
  })

  if (!ordersWithPermit.length) return null

  const titleContent = (
    <>
      Partial approval may block <span className={'font-bold'}>{ordersWithPermit.length}</span> other orders
    </>
  )

  return (
    <AccordionBanner title={titleContent} accordionPadding={'9px 6px'}>
      <styledEl.DropdownList>
        <AffectedPermitOrdersTable orders={ordersWithPermit} />
      </styledEl.DropdownList>
      <styledEl.DropdownFooter>
        There are <span className={'font-bold'}>{ordersWithPermit.length}</span> existing orders using a{' '}
        <TokenSymbol className={'font-bold'} token={currency} /> token approval. If you sign a new one, only one order
        can fill. Continue with current permit amount or choose full approval so all orders can be filled.
      </styledEl.DropdownFooter>
    </AccordionBanner>
  )
}
