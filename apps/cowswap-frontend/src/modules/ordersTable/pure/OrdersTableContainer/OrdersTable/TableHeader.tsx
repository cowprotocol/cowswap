import React, { ReactNode, useEffect, useRef } from 'react'

import { HeaderElement } from './styled'

import { OrderTabId } from '../../../const/tabs'
import { useOrdersTableState } from '../../../hooks/useOrdersTableState'
import { OrderTableItem } from '../../../types'
import { tableItemsToOrders } from '../../../utils/orderTableGroupUtils'
import { CheckboxCheckmark, TableHeaderWrapper, TableRowCheckbox, TableRowCheckboxWrapper } from '../styled'
import { TableHeaderConfig } from '../tableHeaders'

interface TableHeaderProps {
  currentTab: OrderTabId
  isRowSelectable: boolean
  allOrdersSelected: boolean
  visibleHeaders: TableHeaderConfig[]
  cancellableOrders: OrderTableItem[]
  ordersPage: OrderTableItem[]
}

export function TableHeader({
  currentTab,
  isRowSelectable,
  allOrdersSelected,
  visibleHeaders,
  cancellableOrders,
  ordersPage,
}: TableHeaderProps): ReactNode {
  const { orderActions, isTwapTable, selectedOrders } = useOrdersTableState() || {}

  const checkboxRef = useRef<HTMLInputElement>(null)

  // React doesn't support indeterminate attribute
  // Because of it, we have to use element reference
  useEffect(() => {
    const checkbox = checkboxRef.current

    if (!checkbox) return

    checkbox.indeterminate = !!selectedOrders?.length && !allOrdersSelected
    checkbox.checked = allOrdersSelected
  }, [allOrdersSelected, selectedOrders?.length])

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
