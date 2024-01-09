import React from 'react'

import { Network, UiError } from 'types'
import { TableState, TableStateSetters } from '../useTable'
import { Token } from 'hooks/useGetTokens'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  error?: UiError
  data: Token[] | undefined
  networkId: BlockchainNetwork
  isLoading: boolean
  tableState: TableState
} & TableStateSetters

export const TokensTableContext = React.createContext({} as CommonState)
