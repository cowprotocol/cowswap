import { Currency } from '@uniswap/sdk-core'

export { default } from './CommonBasesMod'

export interface CommonBasesProps {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
  className?: string
}
