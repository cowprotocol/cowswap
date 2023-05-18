import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import Important from 'assets/cow-swap/important.svg'
import { WarningBanner } from 'common/pure/WarningBanner'
import { TokenAmount } from 'common/pure/TokenAmount'
import { Nullish } from 'types'

export function BundleTxApprovalBanner() {
  return (
    <WarningBanner
      icon={Important}
      content={
        <>
          <strong>Token approval</strong>: For your convenience, token approval and order placement will be bundled into
          a single transaction, streamlining your experience!
        </>
      }
    />
  )
}

export type SmallVolumeWarningBannerProps = {
  feePercentage: Nullish<Percent>
  feeAmount: Nullish<CurrencyAmount<Currency>>
}

export function SmallVolumeWarningBanner({ feePercentage, feeAmount }: SmallVolumeWarningBannerProps) {
  return (
    <WarningBanner
      content={
        <>
          Small orders are unlikely to be executed. For this order, network fees would be{' '}
          <b>
            {feePercentage?.toFixed(2)}% (
            <TokenAmount amount={feeAmount} tokenSymbol={feeAmount?.currency} />)
          </b>{' '}
          of your sell amount! Therefore, your order is unlikely to execute.
          {/*<br />*/}
          {/* TODO: add link to somewhere */}
          {/*<a href="/">Learn more ↗</a>*/}
        </>
      }
    />
  )
}
