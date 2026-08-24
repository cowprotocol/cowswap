import { ReactNode } from 'react'

import { TabOrderTypes } from 'entities/routes/routes.atom'

import { ProtocolFeeInfoBanner } from 'modules/limitOrders'

import * as styledEl from './MobileOrders.styled'
import { MobileOrdersList } from './MobileOrdersList.pure'

import { useShouldDisplayProtocolFeeBanner } from '../../hooks/useShouldDisplayProtocolFeeBanner'

export interface MobileOrdersContentProps {
  orderType: TabOrderTypes
  hasActiveFilters: boolean
  onClose(): void
  onResetFilters(): void
}

export function MobileOrdersContent({
  orderType,
  hasActiveFilters,
  onClose,
  onResetFilters,
}: MobileOrdersContentProps): ReactNode {
  const shouldDisplayProtocolFeeBanner = useShouldDisplayProtocolFeeBanner()

  return (
    <>
      {shouldDisplayProtocolFeeBanner ? (
        <styledEl.Banner>
          <ProtocolFeeInfoBanner margin="0" />
        </styledEl.Banner>
      ) : null}

      <MobileOrdersList
        orderType={orderType}
        hasActiveFilters={hasActiveFilters}
        onClose={onClose}
        onResetFilters={onResetFilters}
      />
    </>
  )
}
