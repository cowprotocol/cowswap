import { useAtomValue } from 'jotai'
import { ReactNode, Suspense, useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Dialog, DialogOrInline, Media, Modal, ModalHeader } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
import { TabOrderTypes } from 'entities/routes/routes.atom'

import { Loading } from 'legacy/components/FlashingLoading'

import { limitOrdersSettingsAtom, LimitOrdersWidget, useIsWidgetUnlocked } from 'modules/limitOrders'
import { LimitOrdersPermitUpdater, ordersTableStateAtom, OrdersTableWidget, useOrdersTable } from 'modules/ordersTable'
import * as styledEl from 'modules/trade'
import { useOrdersTableDrawerState, useSetOrdersTableDrawerOpen } from 'modules/trade'

const LIMIT_ORDERS_MAX_WIDTH = '1800px'

export function RegularLimitOrdersPage(): ReactNode {
  useOrdersTable(TabOrderTypes.LIMIT)

  const { t } = useLingui()
  const isUnlocked = useIsWidgetUnlocked()
  const { pendingOrders } = useAtomValue(ordersTableStateAtom)
  const { hideOrdersTable } = useInjectedWidgetParams()
  const { ordersTableOnLeft } = useAtomValue(limitOrdersSettingsAtom)
  const { isOpen: isOrdersTableDrawerOpen } = useOrdersTableDrawerState()
  const setOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

  const handleOrdersTableDrawerOpenChange = useCallback(
    (open: boolean) => {
      setOrdersTableDrawerOpen(open)
    },
    [setOrdersTableDrawerOpen],
  )

  return (
    <styledEl.PageWrapper
      isUnlocked={isUnlocked}
      secondaryOnLeft={ordersTableOnLeft}
      maxWidth={LIMIT_ORDERS_MAX_WIDTH}
      hideOrdersTable={hideOrdersTable || isUpToLarge}
    >
      <styledEl.PrimaryWrapper>
        <LimitOrdersWidget />
      </styledEl.PrimaryWrapper>

      {!hideOrdersTable && isUnlocked && (
        <DialogOrInline
          isDialog={isUpToLarge}
          isOpen={isOrdersTableDrawerOpen}
          onOpenChange={handleOrdersTableDrawerOpenChange}
        >
          <Modal.Root className="trade-orders-table">
            {isUpToLarge ? (
              <ModalHeader
                sticky
                title={t`Limit orders`}
                titleAs={Dialog.Title}
                onClose={() => setOrdersTableDrawerOpen(false)}
              />
            ) : null}
            <styledEl.SecondaryWrapper $inDrawer={isUpToLarge}>
              {pendingOrders.length > 0 && <LimitOrdersPermitUpdater orders={pendingOrders} />}
              <Suspense fallback={<Loading />}>
                <OrdersTableWidget orderType={TabOrderTypes.LIMIT} />
              </Suspense>
            </styledEl.SecondaryWrapper>
          </Modal.Root>
        </DialogOrInline>
      )}
    </styledEl.PageWrapper>
  )
}
