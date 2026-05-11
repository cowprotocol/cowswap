import { useSetAtom } from 'jotai/index'
import { useEffect } from 'react'

import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'

import { ordersMock } from './ordersTable.mock'

import { ordersTableStateAtom } from '../state/ordersTable.atoms'

// TODO: set values
const balancesAndAllowances: BalancesAndAllowances = {
  balances: {},
  allowances: {},
  isLoading: false,
}

function Wrapper(): null {
  const setOrdersTableState = useSetAtom(ordersTableStateAtom)

  useEffect(() => {
    setOrdersTableState({
      reduxOrders: [],
      pendingOrders: [],
      orders: ordersMock,
      ordersList: {
        open: ordersMock,
        history: [],
        unfillable: [],
        signing: [],
      },
      filteredOrders: ordersMock,
      balancesAndAllowances,
      hasHydratedOrders: true,
    })
  }, [setOrdersTableState])

  return null
}

const Fixtures = {
  default: () => <Wrapper />,
}

export default Fixtures
