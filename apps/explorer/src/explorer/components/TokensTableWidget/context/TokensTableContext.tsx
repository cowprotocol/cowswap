import React from 'react'

import { Token } from '../../../../hooks/useGetTokens'
import { Network, UiError } from '../../../../types'
import { TableState, TableStateSetters } from '../useTable'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  error?: UiError
  data: Token[] | undefined
  networkId: BlockchainNetwork
  isLoading: boolean
  tableState: TableState
} & TableStateSetters

export const TokensTableContext = React.createContext({} as CommonState)
