import { Nullish } from '@cowprotocol/types'
import { InlineBanner, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

export type SmallVolumeWarningBannerProps = {
  feePercentage: Nullish<Percent>
  feeAmount: Nullish<CurrencyAmount<Currency>>
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SmallVolumeWarningBanner({ feePercentage, feeAmount }: SmallVolumeWarningBannerProps) {
  const formattedFeePercentage = feePercentage?.toFixed(2)

  return (
    <InlineBanner iconSize={32}>
      <strong>
        <Trans>Small orders are unlikely to be executed</Trans>
      </strong>
      <p>
        <Trans>
          For this order, network costs would be{' '}
          <b>
            {formattedFeePercentage}% (<TokenAmount amount={feeAmount} tokenSymbol={feeAmount?.currency} />)
          </b>{' '}
          of your sell amount! Therefore, your order is unlikely to execute.
        </Trans>
      </p>
      {/*<br />*/}
      {/* TODO: add link to somewhere */}
      {/*<a href="/">Learn more ↗</a>*/}
    </InlineBanner>
  )
}
