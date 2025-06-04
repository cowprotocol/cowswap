import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Order } from 'api/operator'

import { BaseDetailsTable } from './BaseDetailsTable'

export interface SummaryDetailsTableProps {
  chainId: SupportedChainId
  order: Order
  showFillsButton: boolean | undefined
  areTradesLoading: boolean
}

// Minimal order view showing only essential information (e.g. for a swap + bridge order)
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SummaryDetailsTable(props: SummaryDetailsTableProps) {
  return <BaseDetailsTable {...props} />
}
