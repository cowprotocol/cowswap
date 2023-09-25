import { TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ButtonSecondary } from '../ButtonSecondary'
import { CowSwapSafeAppLink } from '../CowSwapSafeAppLink'

import { InlineBanner, InlineBannerProps } from './index'

export enum BannerOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export function BundleTxApprovalBanner() {
  return (
    <InlineBanner bannerType="information">
      <strong>Token approval bundling</strong>
      <p>
        For your convenience, token approval and order placement will be bundled into a single transaction, streamlining
        your experience!
      </p>
    </InlineBanner>
  )
}

export type BundleTxWrapBannerProps = {
  nativeCurrencySymbol: string
  wrappedCurrencySymbol: string
}

export function BundleTxWrapBanner({ nativeCurrencySymbol, wrappedCurrencySymbol }: BundleTxWrapBannerProps) {
  return (
    <InlineBanner bannerType="information">
      <strong>Token wrapping bundling</strong>
      <p>
        For your convenience, CoW Swap will bundle all the necessary actions for this trade into a single transaction.
        This includes the&nbsp;{nativeCurrencySymbol}&nbsp;wrapping and, if needed,&nbsp;{wrappedCurrencySymbol}
        &nbsp;approval. Even if the trade fails, your wrapping and approval will be done!
      </p>
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
    <InlineBanner bannerType="information">
      <strong>Use Safe web app</strong>
      <p>
        Use the Safe web app for streamlined trading: {supportsWrappingText}token approval and orders bundled in one go!
        Only available in the <CowSwapSafeAppLink />
      </p>
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
      <strong>Small orders are unlikely to be executed</strong>
      <p>
        For this order, network fees would be{' '}
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

type CustomRecipientBannerProps = InlineBannerProps & { onDismiss?: () => void }

export function CustomRecipientWarningBanner({
  bannerType,
  borderRadius,
  orientation,
  iconSize = 21,
  iconPadding = '0',
  padding = '10px 16px',
  onDismiss,
}: CustomRecipientBannerProps) {
  const handleDismiss = () => onDismiss?.()

  return (
    <InlineBanner
      borderRadius={borderRadius}
      orientation={orientation}
      iconSize={iconSize}
      iconPadding={iconPadding}
      bannerType={bannerType}
      padding={padding}
    >
      <p>
        <strong>Caution:</strong> Order recipient address differs from order owner!
      </p>
      {onDismiss && (
        <ButtonSecondary minHeight={'28px'} onClick={handleDismiss}>
          Dismiss
        </ButtonSecondary>
      )}
    </InlineBanner>
  )
}
