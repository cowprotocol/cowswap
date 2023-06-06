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

export type BundleTxWrapBannerProps = {
  nativeCurrencySymbol: string
  wrappedCurrencySymbol: string
}

export function BundleTxWrapBanner({ nativeCurrencySymbol, wrappedCurrencySymbol }: BundleTxWrapBannerProps) {
  return (
    <InlineBanner
      type="information"
      content={
        <>
          <strong>Token wrapping</strong>: For your convenience, CoW Swap will bundle all the necessary actions for this
          trade into a single transaction. This includes the {nativeCurrencySymbol} wrapping and, if needed,{' '}
          {wrappedCurrencySymbol} approval. Even if the trade fails, your wrapping and approval will be done!
        </>
      }
    />
  )
}

// If supportsWrapping is true, nativeCurrencySymbol is required
type WrappingSupportedProps = { supportsWrapping: true; nativeCurrencySymbol: string }
// If supportsWrapping is not set or false, nativeCurrencySymbol is not required
type WrappingUnsupportedProps = { supportsWrapping?: false; nativeCurrencySymbol?: undefined }

export type BundleTxSafeWcBannerProps = WrappingSupportedProps | WrappingUnsupportedProps

export function BundleTxSafeWcBanner({ nativeCurrencySymbol, supportsWrapping }: BundleTxSafeWcBannerProps) {
  const supportsWrappingText = supportsWrapping ? `${nativeCurrencySymbol} wrapping, ` : ''

  return (
    <InlineBanner
      type="information"
      content={
        <>
          Use the Safe web app for streamlined trading: {supportsWrappingText}token approval and orders bundled in one
          go! Only available in the{' '}
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
