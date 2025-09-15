import { ReactNode, useState } from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { AlertCircle } from 'react-feather'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import * as styledEl from './styled'

// todo fix imports
import { ToggleArrow } from '../../../../common/pure/ToggleArrow'
import { doesOrderHavePermit } from '../../../../common/utils/doesOrderHavePermit'
import { AffectedOrdersWithPermit } from '../../pure'

export function ActiveOrdersWithAffectedPermit({ currency }: { currency: Currency }): ReactNode {
  const { chainId, account } = useWalletInfo()
  const pendingOrders = useOnlyPendingOrders(chainId, account)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const ordersWithPermit = pendingOrders.filter((order) => {
    // need to check for buy order
    return doesOrderHavePermit(order) && currency.equals(order.inputToken)
  })

  if (!ordersWithPermit.length) return null

  return (
    <styledEl.DropdownWrapper>
      <styledEl.DropdownHeader isOpened={isDropdownOpen} onClick={(): void => setIsDropdownOpen((prev) => !prev)}>
        <AlertCircle />
        Partial approval may block <span className={'font-bold'}>{ordersWithPermit.length}</span> other orders
        <styledEl.ArrowWrapper>
          <ToggleArrow size={10} isOpen={isDropdownOpen} />
        </styledEl.ArrowWrapper>
      </styledEl.DropdownHeader>
      {isDropdownOpen ? (
        <>
          <styledEl.DropdownList>
            <AffectedOrdersWithPermit orders={ordersWithPermit} />
          </styledEl.DropdownList>
          <styledEl.DropdownFooter>
            There are <span className={'font-bold'}>{ordersWithPermit.length}</span> existing orders using a{' '}
            <TokenSymbol className={'font-bold'} token={currency} /> token approval. If you sign a new one, only one
            order can fill. Continue with current permit amount or choose full approval so all orders can be filled.
          </styledEl.DropdownFooter>
        </>
      ) : null}
    </styledEl.DropdownWrapper>
  )
}
