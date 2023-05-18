import React, { useCallback, useState } from 'react'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { getIsMetaMask } from 'modules/wallet/api/utils/connection'
import { addTokenToMetamaskAnalytics } from 'components/analytics'
import { AddToMetamask as AddToMetamaskPure } from 'modules/wallet/api/pure/AddToMetamask'

import useCurrencyLogoURIs from 'lib/hooks/useCurrencyLogoURIs'

export type AddToMetamaskProps = {
  currency: Currency | undefined
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
