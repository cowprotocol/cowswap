import React, { useCallback, useState } from 'react'

import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { Nullish } from 'types'

import { addTokenToMetamaskAnalytics } from 'legacy/components/analytics'

import { AddToMetamask as AddToMetamaskPure } from 'modules/wallet/api/pure/AddToMetamask'
import { getIsMetaMask } from 'modules/wallet/api/utils/connection'

import useCurrencyLogoURIs from 'common/pure/CurrencyLogo/hooks/useCurrencyLogoURIs'

export type AddToMetamaskProps = {
  currency: Nullish<Currency>
  shortLabel?: boolean
}

export default function AddToMetamask(props: AddToMetamaskProps) {
  const { currency, shortLabel } = props
  const { connector } = useWeb3React()
  const isMetamask = getIsMetaMask()

  const [success, setSuccess] = useState<boolean | undefined>()

  const token = currency?.wrapped
  const logoURL = useCurrencyLogoURIs(token)[0]

  const addToken = useCallback(() => {
    if (!token?.symbol || !connector.watchAsset) return
    connector
      .watchAsset({
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        image: logoURL,
      })
      .then(() => {
        addTokenToMetamaskAnalytics('Succeeded', token.symbol)
        setSuccess(true)
      })
      .catch(() => {
        addTokenToMetamaskAnalytics('Failed', token.symbol)
        setSuccess(false)
      })
  }, [connector, logoURL, token])

  if (!currency || !isMetamask) {
    return null
  }

  return <AddToMetamaskPure success={success} addToken={addToken} currency={currency} shortLabel={shortLabel} />
}
