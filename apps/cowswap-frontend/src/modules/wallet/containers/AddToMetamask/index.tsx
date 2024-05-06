import React, { useCallback, useState } from 'react'

import { addTokenToMetamaskAnalytics } from '@cowprotocol/analytics'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { getTokenLogoUrls } from '@cowprotocol/tokens'
import { getIsMetaMask } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Currency } from '@uniswap/sdk-core'

import { AddToMetamask as AddToMetamaskPure } from '../../pure/AddToMetamask'

export type AddToMetamaskProps = {
  currency: Currency | null | undefined
  shortLabel?: boolean
  className?: string
}

export function AddToMetamask(props: AddToMetamaskProps) {
  const { currency, shortLabel, className } = props
  const provider = useWalletProvider()
  const isMetamask = getIsMetaMask()

  const [success, setSuccess] = useState<boolean | undefined>()

  const token = currency && getWrappedToken(currency)
  const logoURL = getTokenLogoUrls(token as TokenWithLogo)[0]

  const addToken = useCallback(() => {
    if (!token?.symbol || !provider?.provider?.request) return

    provider.provider
      .request({
        method: 'wallet_watchAsset',
        params: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: logoURL,
        } as never,
      })
      .then(() => {
        addTokenToMetamaskAnalytics('Succeeded', token.symbol)
        setSuccess(true)
      })
      .catch(() => {
        addTokenToMetamaskAnalytics('Failed', token.symbol)
        setSuccess(false)
      })
  }, [provider, logoURL, token])

  if (!currency || !isMetamask) {
    return null
  }

  return (
    <AddToMetamaskPure
      className={className}
      success={success}
      addToken={addToken}
      currency={currency}
      shortLabel={shortLabel}
    />
  )
}
