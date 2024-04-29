import React from 'react'

import { Order } from '../../../../api/operator'
import { Network, UiError } from '../../../../types'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  txHashParams: { networkId: BlockchainNetwork; txHash: string }
  error?: UiError
  orders: Order[] | undefined
  isTxLoading: boolean
}

export const TransactionsTableContext = React.createContext({} as CommonState)
