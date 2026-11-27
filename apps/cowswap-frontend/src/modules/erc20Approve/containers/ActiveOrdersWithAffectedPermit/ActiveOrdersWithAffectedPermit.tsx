import { useAtomValue } from 'jotai'
import { ReactNode, useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import type { AccountAddress } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { TokenSymbol } from '@cowprotocol/ui'

import { Plural, Trans } from '@lingui/react/macro'

import { AffectedPermitOrdersTable, onlyPendingOrdersAtom, pendingEoaTwapOrdersAtom } from 'modules/ordersTable'

import { AccordionBanner } from 'common/pure/AccordionBanner'
import { doesOrderHavePermit } from 'common/utils/doesOrderHavePermit'
import { doesOrderUsePollerApproval } from 'common/utils/doesOrderUsePollerApproval'

import * as styledEl from './styled'

import { useIsPartialApproveSelectedByUser } from '../../state'

import type { AffectedOrdersApprovalTarget } from '../../types/affectedOrdersApprovalTarget.types'

interface ActiveOrdersWithAffectedPermitProps {
  currency: Currency
  orderId?: string
  approvalTarget?: AffectedOrdersApprovalTarget
}

export function ActiveOrdersWithAffectedPermit({
  currency,
  orderId,
  approvalTarget = 'vault-relayer',
}: ActiveOrdersWithAffectedPermitProps): ReactNode {
  const pendingOrders = useAtomValue(onlyPendingOrdersAtom)
  const pendingEoaTwapOrders = useAtomValue(pendingEoaTwapOrdersAtom)
  const pollerAddress = useTradeSpenderAddress()
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()

  const affectedOrders = useMemo(() => {
    if (approvalTarget === 'poller') {
      if (!pollerAddress) return []

      return pendingEoaTwapOrders.filter((order) => {
        return (
          order.id !== orderId &&
          currency.equals(order.inputToken) &&
          doesOrderUsePollerApproval(order, pollerAddress as AccountAddress)
        )
      })
    }

    return pendingOrders.filter((order) => {
      return order.id !== orderId && currency.equals(order.inputToken) && doesOrderHavePermit(order)
    })
  }, [approvalTarget, pendingOrders, pendingEoaTwapOrders, pollerAddress, orderId, currency])

  if (!affectedOrders.length || !isPartialApproveSelectedByUser) return null

  const affectedOrdersLength = affectedOrders.length

  const titleContent = (
    <Trans>
      Partial approval may block <span className={'font-bold'}>{affectedOrdersLength}</span>{' '}
      <Plural
        value={affectedOrdersLength}
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
        <AffectedPermitOrdersTable ordersWithPermit={affectedOrders} />
      </styledEl.DropdownList>
      <styledEl.DropdownFooter>
        {approvalTarget === 'poller' ? (
          <Trans>
            <Plural value={affectedOrdersLength} one="There is" few="There are" many="There are" other="There are" />{' '}
            <span className={'font-bold'}>{affectedOrdersLength}</span> existing{' '}
            <Plural
              value={affectedOrdersLength}
              one="TWAP order"
              few="TWAP orders"
              many="TWAP orders"
              other="TWAP orders"
            />{' '}
            that share this <TokenSymbol className={'font-bold'} token={currency} /> allowance for funding. Partial
            approval may affect the execution of other TWAP orders. Adjust the amount or choose full approval to
            proceed.
          </Trans>
        ) : (
          <Trans>
            <Plural value={affectedOrdersLength} one="There is" few="There are" many="There are" other="There are" />{' '}
            <span className={'font-bold'}>{affectedOrdersLength}</span> existing{' '}
            <Plural value={affectedOrdersLength} one="order" few="orders" many="orders" other="orders" /> using a{' '}
            <TokenSymbol className={'font-bold'} token={currency} /> token approval. Partial approval may affect the
            execution of other orders. Adjust the amount or choose full approval to proceed.
          </Trans>
        )}
      </styledEl.DropdownFooter>
    </AccordionBanner>
  )
}
