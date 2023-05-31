import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ExternalLink } from 'legacy/theme'

import { TokenAmount } from 'common/pure/TokenAmount'

import { InlineBanner } from './index'

export function BundleTxApprovalBanner() {
  return (
    <InlineBanner
      type="information"
      content={
        <>
          <strong>Token approval</strong>: For your convenience, token approval and order placement will be bundled into
          a single transaction, streamlining your experience!
        </>
      }
    />
  )
}

export function BundleTxSafeWcBanner() {
  return (
    <InlineBanner
      type="information"
      content={
        <>
          Use the Safe web app for streamlined trading: token approval and orders bundled in one go! Only available in
          the{' '}
          <ExternalLink href="https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fswap.cow.fi&chain=eth">
            CoW Swap Safe App↗
          </ExternalLink>
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
    <InlineBanner
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
