import { ReactElement, useCallback, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { getTokenLogoUrls } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { useIsAssetWatchingSupported, useWalletDetails } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Currency } from '@uniswap/sdk-core'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { WatchAssetInWallet as WatchAssetInWalletPure } from '../../pure/WatchAssetInWallet'

export type WatchAssetInWalletProps = {
  currency: Currency | null | undefined
  shortLabel?: boolean
  className?: string
  fallback?: ReactElement
  onClick?: Command
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function WatchAssetInWallet(props: WatchAssetInWalletProps) {
  const { currency, shortLabel, className, fallback } = props
  const { icon, walletName } = useWalletDetails()
  const provider = useWalletProvider()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isAssetWatchingSupported = useIsAssetWatchingSupported()
  const cowAnalytics = useCowAnalytics()

  const [success, setSuccess] = useState<boolean | undefined>()

  const token = currency && getWrappedToken(currency)
  const logoURL = getTokenLogoUrls(token as TokenWithLogo)[0]

  const addToken = useCallback(() => {
    if (!token?.symbol || !provider?.provider?.request) return

    provider
      .send('wallet_watchAsset', {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: logoURL,
        },
      } as never)
      .then(() => {
        // Track success event
        cowAnalytics.sendEvent({
          category: CowSwapAnalyticsCategory.WALLET,
          action: 'Watch Asset',
          label: `Succeeded: ${token.symbol}`,
        })
        setSuccess(true)
      })
      .catch((error) => {
        console.error('Can not add an asset to wallet', error)
        // Track failure event
        cowAnalytics.sendEvent({
          category: CowSwapAnalyticsCategory.WALLET,
          action: 'Watch Asset',
          label: `Failed: ${token.symbol}`,
        })
        setSuccess(false)
      })
  }, [provider, logoURL, token, cowAnalytics])

  if (!currency || !icon || !walletName || isProviderNetworkUnsupported || !isAssetWatchingSupported) {
    return fallback || null
  }

  return (
    <WatchAssetInWalletPure
      className={className}
      walletName={walletName}
      walletIcon={icon}
      success={success}
      addToken={addToken}
      currency={currency}
      shortLabel={shortLabel}
      data-click-event={toCowSwapGtmEvent({
        category: CowSwapAnalyticsCategory.WALLET,
        action: 'Click Watch Asset',
      })}
    />
  )
}
