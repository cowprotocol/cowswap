import { useAtomValue } from 'jotai'
import { ReactNode, useMemo } from 'react'

import { Currency } from '@cowprotocol/currency'
import { TokenSymbol } from '@cowprotocol/ui'

import { Plural, Trans } from '@lingui/react/macro'

import { AffectedPermitOrdersTable, onlyPendingOrdersAtom } from 'modules/ordersTable'

import { AccordionBanner } from 'common/pure/AccordionBanner'
import { doesOrderHavePermit } from 'common/utils/doesOrderHavePermit'

import * as styledEl from './styled'

import { useIsPartialApproveSelectedByUser } from '../../state'

interface ActiveOrdersWithAffectedPermitProps {
  currency: Currency
  orderId?: string
}

export function ActiveOrdersWithAffectedPermit({ currency, orderId }: ActiveOrdersWithAffectedPermitProps): ReactNode {
  const pendingOrders = useAtomValue(onlyPendingOrdersAtom)
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()

  const ordersWithPermit = useMemo(() => {
    return pendingOrders.filter((order) => {
      return order.id !== orderId && currency.equals(order.inputToken) && doesOrderHavePermit(order)
    })
  }, [pendingOrders, orderId, currency])

  if (!ordersWithPermit.length || !isPartialApproveSelectedByUser) return null

  const ordersWithPermitLength = ordersWithPermit.length

  const titleContent = (
    <Trans>
      Partial approval may block <span className={'font-bold'}>{ordersWithPermitLength}</span>{' '}
      <Plural
        value={ordersWithPermitLength}
        one="other order"
        few="other orders"
        many="other orders"
        other="other orders"
      />
    </Trans>
  )

  return (
    <AccordionBanner title={titleContent} accordionPadding={'9px 6px'}>
      <styledEl.DropdownList>
        <AffectedPermitOrdersTable ordersWithPermit={ordersWithPermit} />
      </styledEl.DropdownList>
      <styledEl.DropdownFooter>
        <Trans>
          <Plural value={ordersWithPermitLength} one="There is" other="There are" />{' '}
          <span className={'font-bold'}>{ordersWithPermitLength}</span> existing{' '}
          <Plural value={ordersWithPermitLength} one="order" few="orders" many="orders" other="orders" /> using a{' '}
          <TokenSymbol className={'font-bold'} token={currency} /> token approval. Partial approval may affect the
          execution of other orders. Adjust the amount or choose full approval to proceed.
        </Trans>
      </styledEl.DropdownFooter>
    </AccordionBanner>
  )
}
