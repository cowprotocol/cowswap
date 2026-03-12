import { useAtomValue } from 'jotai'
import { ReactNode, useMemo } from 'react'

import { Currency } from '@cowprotocol/currency'
import { TokenSymbol } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'

import { AffectedPermitOrdersTable, ordersTableStateAtom } from 'modules/ordersTable'

import { AccordionBanner } from 'common/pure/AccordionBanner'
import { doesOrderHavePermit } from 'common/utils/doesOrderHavePermit'

import * as styledEl from './styled'

import { useIsPartialApproveSelectedByUser } from '../../state'

interface ActiveOrdersWithAffectedPermitProps {
  currency: Currency
  orderId?: string
}

export function ActiveOrdersWithAffectedPermit({ currency, orderId }: ActiveOrdersWithAffectedPermitProps): ReactNode {
  const { t } = useLingui()
  const { pendingOrders } = useAtomValue(ordersTableStateAtom)
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()

  // TODO: Consider moving to atom:
  const ordersWithPermit = useMemo(() => {
    return pendingOrders.filter((order) => {
      return order.id !== orderId && currency.equals(order.inputToken) && doesOrderHavePermit(order)
    })
  }, [pendingOrders, orderId, currency])

  if (!ordersWithPermit.length || !isPartialApproveSelectedByUser) return null

  const ordersWithPermitLength = ordersWithPermit.length
  const isPlural = ordersWithPermit.length > 1
  const orderWord = isPlural ? t`orders` : t`order`

  const titleContent = (
    <Trans>
      Partial approval may block <span className={'font-bold'}>{ordersWithPermitLength}</span> other {orderWord}
    </Trans>
  )

  const areIs = isPlural ? t`are` : t`is`

  return (
    <AccordionBanner title={titleContent} accordionPadding={'9px 6px'}>
      <styledEl.DropdownList>
        <AffectedPermitOrdersTable ordersWithPermit={ordersWithPermit} />
      </styledEl.DropdownList>
      <styledEl.DropdownFooter>
        <Trans>
          There {areIs} <span className={'font-bold'}>{ordersWithPermitLength}</span> existing {orderWord} using a{' '}
          <TokenSymbol className={'font-bold'} token={currency} /> token approval. Partial approval may affect the
          execution of other orders. Adjust the amount or choose full approval to proceed.
        </Trans>
      </styledEl.DropdownFooter>
    </AccordionBanner>
  )
}
