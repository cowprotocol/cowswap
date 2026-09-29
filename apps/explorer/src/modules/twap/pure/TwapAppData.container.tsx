import type { ReactNode } from 'react'

import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DetailRow } from 'components/common/DetailRow'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { AppDataItem } from 'components/orders/DetailsTable/items/AppDataItem'

import { useTwapAppData } from '../hooks/useTwapAppData'

export function TwapAppData({ appData, chainId }: { appData: string; chainId: SupportedChainId }): ReactNode {
  const { data, error, isLoading } = useTwapAppData(appData, chainId)

  if (data?.fullAppData) return <AppDataItem appData={appData} fullAppData={data.fullAppData} />

  return (
    <DetailRow label="AppData">
      <RowWithCopyButton textToCopy={appData} contentsToDisplay={appData} />
      <span>{isLoading && !error ? 'Loading app data…' : 'App data is unavailable.'}</span>
    </DetailRow>
  )
}
