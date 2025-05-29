import React from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import { Order } from 'api/operator'

import { FullDetailsTable } from './FullDetailsTable'
import { SummaryDetailsTable } from './SummaryDetailsTable'

export { FullDetailsTable, SummaryDetailsTable }

export type Props = {
  chainId: SupportedChainId
  order: Order
  showFillsButton: boolean | undefined
  areTradesLoading: boolean
  viewFills: Command
  isPriceInverted: boolean
  invertPrice: Command
}

// Default DetailsTable component that renders the full details table (backward compatibility)
export function DetailsTable(props: Props): React.ReactNode | null {
  return <FullDetailsTable {...props} />
}
