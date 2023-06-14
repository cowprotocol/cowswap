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
        <strong>Minimum sell size:</strong> The sell amount per part of your TWAP order should be at least{' '}
        <strong>
          $<TokenAmount amount={amount} hideTokenSymbol />
        </strong>
        . Decrease the number of parts or increase the total sell amount.
      </>
    </InlineBanner>
  )
}
