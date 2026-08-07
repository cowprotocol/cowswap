import { ReactNode } from 'react'

import { safeShortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { BaseAccountCard } from '../BaseAccountCard/BaseAccountCard.pure'
import { DefaultAccountContent } from '../DefaultAccountContent/DefaultAccountContent.pure'

interface AccountDataCardProps {
  account: string
  chainId: SupportedChainId
  totalUsdAmount?: CurrencyAmount<Currency> | null
  loading?: boolean
  showWatermark?: boolean
  width?: number | string
  height?: number | string
  borderRadius?: number
  padding?: number
  margin?: string
  minHeight?: number | string
}

export function AccountDataCard({
  account,
  chainId,
  totalUsdAmount,
  loading,
  showWatermark = false,
  width,
  height,
  borderRadius,
  padding,
  margin,
  minHeight,
}: AccountDataCardProps): ReactNode {
  return (
    <BaseAccountCard
      width={width}
      height={height}
      borderRadius={borderRadius}
      padding={padding}
      margin={margin}
      minHeight={minHeight}
      showWatermark={showWatermark}
      ariaLabel={`Account ${safeShortenAddress(account)} overview`}
    >
      <DefaultAccountContent account={account} chainId={chainId} totalUsdAmount={totalUsdAmount} loading={loading} />
    </BaseAccountCard>
  )
}
