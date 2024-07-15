import { ReactElement, useCallback, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { getTokenLogoUrls } from '@cowprotocol/tokens'
import { useIsAssetWatchingSupported, useWalletDetails } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Currency } from '@uniswap/sdk-core'

import { watchAssetInWalletAnalytics } from 'modules/analytics'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { WatchAssetInWallet as WatchAssetInWalletPure } from '../../pure/WatchAssetInWallet'

export type WatchAssetInWalletProps = {
  currency: Currency | null | undefined
  shortLabel?: boolean
  className?: string
  fallback?: ReactElement
}

export function WatchAssetInWallet(props: WatchAssetInWalletProps) {
  const { currency, shortLabel, className, fallback } = props
  const { icon, walletName } = useWalletDetails()
  const provider = useWalletProvider()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isAssetWatchingSupported = useIsAssetWatchingSupported()

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
        watchAssetInWalletAnalytics('Succeeded', token.symbol)
        setSuccess(true)
      })
      .catch((error) => {
        console.error('Can not add an asset to wallet', error)
        watchAssetInWalletAnalytics('Failed', token.symbol)
        setSuccess(false)
      })
  }, [provider, logoURL, token])

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
    />
  )
}
