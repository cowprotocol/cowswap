import React from 'react'

import { Trade } from 'api/operator'

import { TableState, TableStateSetters } from '../../../../explorer/components/TokensTableWidget/useTable'

type CommonState = {
  trades: Trade[]
  isLoading: boolean
  tableState: TableState
} & TableStateSetters

export const FillsTableContext = React.createContext({} as CommonState)
