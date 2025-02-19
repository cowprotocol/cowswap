import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { TokenAmount } from '../../pure/TokenAmount'
import { Nullish } from '../../types'

import { InlineBanner } from './index'

export enum BannerOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export type SmallVolumeWarningBannerProps = {
  feePercentage: Nullish<Percent>
  feeAmount: Nullish<CurrencyAmount<Currency>>
}

export function SmallVolumeWarningBanner({ feePercentage, feeAmount }: SmallVolumeWarningBannerProps) {
  return (
    <InlineBanner iconSize={32}>
      <strong>Small orders are unlikely to be executed</strong>
      <p>
        For this order, network costs would be{' '}
        <b>
          {feePercentage?.toFixed(2)}% (
          <TokenAmount amount={feeAmount} tokenSymbol={feeAmount?.currency} />)
        </b>{' '}
        of your sell amount! Therefore, your order is unlikely to execute.
      </p>
      {/*<br />*/}
      {/* TODO: add link to somewhere */}
      {/*<a href="/">Learn more ↗</a>*/}
    </InlineBanner>
  )
}
