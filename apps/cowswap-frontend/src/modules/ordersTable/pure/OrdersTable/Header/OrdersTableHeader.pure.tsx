import { useAtomValue } from 'jotai'
import React, { ReactNode, useEffect, useRef } from 'react'

import { ordersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/ordersToCancel.atom'

import { TableHeaderConfig } from './ordersTableHeader.constants'
import { HeaderElement } from './OrdersTableHeader.styled'
import { TableHeaderWrapper } from './OrdersTableHeader.styled'

import { useOrderActions } from '../../../hooks/useOrderActions'
import { OrderTableItem } from '../../../state/ordersTable.types'
import { OrderTabId } from '../../../state/tabs/ordersTableTabs.constants'
import { tableItemsToOrders } from '../../../utils/orderTableGroupUtils'
import { CheckboxCheckmark, TableRowCheckbox, TableRowCheckboxWrapper } from '../Row/Checkbox/Checkbox.styled'

interface OrdersTableHeaderProps {
  currentTab: OrderTabId
  isRowSelectable: boolean
  isTwapTable: boolean
  allOrdersSelected: boolean
  visibleHeaders: TableHeaderConfig[]
  cancellableOrders: OrderTableItem[]
  ordersPage: OrderTableItem[]
}

export function OrdersTableHeader({
  currentTab,
  isRowSelectable,
  isTwapTable,
  allOrdersSelected,
  visibleHeaders,
  cancellableOrders,
  ordersPage,
}: OrdersTableHeaderProps): ReactNode {
  const orderActions = useOrderActions()
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const ordersToCancelCount = ordersToCancel?.length || 0

  const checkboxRef = useRef<HTMLInputElement>(null)

  // React doesn't support indeterminate attribute
  // Because of it, we have to use element reference
  useEffect(() => {
    const checkbox = checkboxRef.current

    if (!checkbox) return

    checkbox.indeterminate = ordersToCancelCount > 0 && !allOrdersSelected
    checkbox.checked = allOrdersSelected
  }, [allOrdersSelected, ordersToCancelCount])

  return (
    <TableHeaderWrapper
      isHistoryTab={currentTab === OrderTabId.history}
      isRowSelectable={isRowSelectable}
      isTwapTable={isTwapTable}
    >
      {visibleHeaders.map((header) => {
        if (header.id === 'checkbox' && (!isRowSelectable || currentTab === OrderTabId.history)) {
          return null
        }

        if (header.id === 'checkbox') {
          return (
            <HeaderElement key={header.id}>
              <TableRowCheckboxWrapper>
                <TableRowCheckbox
                  ref={checkboxRef}
                  disabled={cancellableOrders.length === 0}
                  type="checkbox"
                  onChange={(event) =>
                    orderActions?.toggleOrdersForCancellation(
                      event.target.checked ? tableItemsToOrders(ordersPage) : [],
                    )
                  }
                />
                <CheckboxCheckmark />
              </TableRowCheckboxWrapper>
            </HeaderElement>
          )
        }

        return (
          <HeaderElement key={header.id} doubleRow={header.doubleRow}>
            {header.content}
            {header.extraComponent}
          </HeaderElement>
        )
      })}
    </TableHeaderWrapper>
  )
}
