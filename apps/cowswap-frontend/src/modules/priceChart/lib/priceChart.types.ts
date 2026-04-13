import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type PriceChartResolution =
  | '1S'
  | '5S'
  | '15S'
  | '30S'
  | '1'
  | '5'
  | '15'
  | '30'
  | '60'
  | '240'
  | '720'
  | '1D'
  | '7D'

export type PriceChartCurrencyCode = 'USD' | 'TOKEN'

export interface PriceChartQueryParams {
  address: string
  chainId: SupportedChainId
  from: number
  to: number
  resolution: PriceChartResolution
  currencyCode?: PriceChartCurrencyCode
  countback?: number
  removeEmptyBars?: boolean
  removeLeadingNullValues?: boolean
}

export interface PriceChartBar {
  open: number
  high: number
  low: number
  close: number
  time: number
  status: string
  volume: string | undefined
}
