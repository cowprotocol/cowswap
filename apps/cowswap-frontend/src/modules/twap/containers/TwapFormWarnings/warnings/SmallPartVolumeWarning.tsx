import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenAmount, InlineBanner } from '@cowprotocol/ui'

import { MINIMUM_PART_SELL_AMOUNT_FIAT } from '../../../const'

export type SmallPartVolumeWarningBannerProps = {
  chainId: SupportedChainId
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
