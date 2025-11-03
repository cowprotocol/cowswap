import { ReactNode } from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { AffectedPermitOrdersTable } from 'modules/ordersTable'

import { AccordionBanner } from 'common/pure/AccordionBanner'
import { doesOrderHavePermit } from 'common/utils/doesOrderHavePermit'

import * as styledEl from './styled'

import { useIsPartialApproveSelectedByUser } from '../../state'

type ActiveOrdersWithAffectedPermitProps = {
  currency: Currency
  orderId?: string
}

export function ActiveOrdersWithAffectedPermit({ currency, orderId }: ActiveOrdersWithAffectedPermitProps): ReactNode {
  const { t } = useLingui()
  const { chainId, account } = useWalletInfo()
  const pendingOrders = useOnlyPendingOrders(chainId, account)
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()

  const ordersWithPermit = pendingOrders.filter((order) => {
    return order.id !== orderId && currency.equals(order.inputToken) && doesOrderHavePermit(order)
  })

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
        <AffectedPermitOrdersTable orders={ordersWithPermit} />
      </styledEl.DropdownList>
      <styledEl.DropdownFooter>
        <Trans>
          There {areIs} <span className={'font-bold'}>{ordersWithPermitLength}</span> existing{' '}
          {orderWord} using a <TokenSymbol className={'font-bold'} token={currency} /> token approval.  Partial approval  
        may affect the execution of other orders. Adjust the amount or choose full approval to proceed.
        </Trans>
      </styledEl.DropdownFooter>
    </AccordionBanner>
  )
}
