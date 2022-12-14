import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { HashLink } from 'react-router-hash-link'
import { Currency } from '@uniswap/sdk-core'
import React from 'react'
import { genericPropsChecker } from '@cow/utils/genericPropsChecker'

export interface CompatibilityIssuesWarningProps {
  currencyIn: Currency
  currencyOut: Currency
  isSupportedWallet: boolean
}

export const CompatibilityIssuesWarning = React.memo((props: CompatibilityIssuesWarningProps) => {
  const { currencyIn, currencyOut, isSupportedWallet } = props
  const currenciesPair = [currencyIn, currencyOut]

  if (!isSupportedWallet) {
    return (
      <UnsupportedCurrencyFooter
        show={true}
        currencies={currenciesPair}
        showDetailsText="Read more about unsupported wallets"
        detailsText={
          <>
            <p>CoW Swap requires offline signatures, which is currently not supported by some wallets.</p>
            <p>
              Read more in the <HashLink to="/faq/protocol#wallet-not-supported">FAQ</HashLink>.
            </p>
          </>
        }
        detailsTitle="This wallet is not yet supported"
      />
    )
  }

  return <UnsupportedCurrencyFooter show={true} currencies={currenciesPair} />
}, genericPropsChecker)
