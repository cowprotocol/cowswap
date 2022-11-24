import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { HashLink } from 'react-router-hash-link'
import { Currency } from '@uniswap/sdk-core'

export interface CompatibilityIssuesWarningProps {
  currencyIn: Currency
  currencyOut: Currency
  isSupportedWallet: boolean
  isEthFlowBuyOrder: boolean
}

export function CompatibilityIssuesWarning(props: CompatibilityIssuesWarningProps) {
  const { currencyIn, currencyOut, isSupportedWallet, isEthFlowBuyOrder } = props
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
  if (isEthFlowBuyOrder) {
    return (
      <UnsupportedCurrencyFooter
        show={true}
        currencies={currenciesPair}
        showDetailsText="Trade not supported"
        detailsText={
          <>
            <p>It&apos;s not possible to create BUY orders of native {currencyIn.symbol}.</p>
            <p>Update the sell amount field to create a SELL order and proceed.</p>
            <p>
              Read more in the (TODO FAQ) <HashLink to="/faq/protocol#wallet-not-supported">FAQ</HashLink>.
            </p>
          </>
        }
        detailsTitle={`Trade type not supported`}
      />
    )
  }

  return <UnsupportedCurrencyFooter show={true} currencies={currenciesPair} />
}
