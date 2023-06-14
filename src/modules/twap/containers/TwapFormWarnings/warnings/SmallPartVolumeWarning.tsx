import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { InlineBanner } from 'common/pure/InlineBanner'
import { TokenAmount } from 'common/pure/TokenAmount'

import { MINIMUM_PART_SELL_AMOUNT_FIAT } from '../../../const'

export type SmallPartVolumeWarningBannerProps = {
  chainId: SupportedChainId
}

export function SmallPartVolumeWarning({ chainId }: SmallPartVolumeWarningBannerProps) {
  const amount = MINIMUM_PART_SELL_AMOUNT_FIAT[chainId]

  return (
    <InlineBanner>
      <>
        TWAP orders require a minimum of{' '}
        <strong>
          <TokenAmount amount={amount} tokenSymbol={amount.currency} />
        </strong>{' '}
        per part. Decrease the number of parts or increase the total sell amount.
      </>
    </InlineBanner>
  )
}
