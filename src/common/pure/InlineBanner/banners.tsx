import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ExternalLink } from 'legacy/theme'

import { MINIMUM_PART_SELL_AMOUNT_FIAT } from 'modules/twap/const'

import { TokenAmount } from 'common/pure/TokenAmount'

import { InlineBanner } from './index'

export function BundleTxApprovalBanner() {
  return (
    <InlineBanner type="information">
      <>
        <strong>Token approval</strong>: For your convenience, token approval and order placement will be bundled into a
        single transaction, streamlining your experience!
      </>
    </InlineBanner>
  )
}

export type BundleTxWrapBannerProps = {
  nativeCurrencySymbol: string
  wrappedCurrencySymbol: string
}

export function BundleTxWrapBanner({ nativeCurrencySymbol, wrappedCurrencySymbol }: BundleTxWrapBannerProps) {
  return (
    <InlineBanner type="information">
      <>
        <strong>Token wrapping</strong>: For your convenience, CoW Swap will bundle all the necessary actions for this
        trade into a single transaction. This includes the {nativeCurrencySymbol} wrapping and, if needed,{' '}
        {wrappedCurrencySymbol} approval. Even if the trade fails, your wrapping and approval will be done!
      </>
    </InlineBanner>
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
    <InlineBanner type="information">
      <>
        Use the Safe web app for streamlined trading: {supportsWrappingText}token approval and orders bundled in one go!
        Only available in the{' '}
        <ExternalLink href="https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fswap.cow.fi&chain=eth">
          CoW Swap Safe App↗
        </ExternalLink>
      </>
    </InlineBanner>
  )
}

export type SmallVolumeWarningBannerProps = {
  feePercentage: Nullish<Percent>
  feeAmount: Nullish<CurrencyAmount<Currency>>
}

export function SmallVolumeWarningBanner({ feePercentage, feeAmount }: SmallVolumeWarningBannerProps) {
  return (
    <InlineBanner>
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
    </InlineBanner>
  )
}

export type SmallPartVolumeWarningBannerProps = {
  chainId: SupportedChainId
}

export function SmallPartVolumeWarningBanner({ chainId }: SmallPartVolumeWarningBannerProps) {
  const amount = MINIMUM_PART_SELL_AMOUNT_FIAT[chainId]

  return (
    <InlineBanner
      content={
        <>
          TWAP orders require a minimum of{' '}
          <strong>
            <TokenAmount amount={amount} tokenSymbol={amount.currency} />
          </strong>{' '}
          per part. Decrease the number of parts or increase the total sell amount.
        </>
      }
    />
  )
}
