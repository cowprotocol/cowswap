import { memo } from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'
import { Currency } from '@uniswap/sdk-core'

import { Link as ReactRouterLink } from 'react-router'

import UnsupportedCurrencyFooter from 'legacy/components/swap/UnsupportedCurrencyFooter'

export interface CompatibilityIssuesWarningProps {
  currencyIn: Currency
  currencyOut: Currency
  isSupportedWallet: boolean
}

export const CompatibilityIssuesWarning = memo((props: CompatibilityIssuesWarningProps) => {
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
              {/*TODO: I think FAQ doesn't exist anymore. Point to docs instead?*/}
              Read more in the{' '}
              <ReactRouterLink target="_blank" to="/faq/protocol#wallet-not-supported">
                FAQ
              </ReactRouterLink>
              .
            </p>
          </>
        }
        detailsTitle="This wallet is not yet supported"
      />
    )
  }

  return <UnsupportedCurrencyFooter show={true} currencies={currenciesPair} />
}, genericPropsChecker)
