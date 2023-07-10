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
      <strong>Minimum sell size</strong>
      <p>
        The sell amount per part of your TWAP order should be at least{' '}
        <b>
          $<TokenAmount amount={amount} hideTokenSymbol />
        </b>
        . Decrease the number of parts or increase the total sell amount.
      </p>
    </InlineBanner>
  )
}
