import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatSmartAmount } from '@cow/utils/format'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { CHAIN_INFO } from 'constants/chainInfo'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'

import * as styledEl from '@cow/modules/swap/pure/EthFlow/WrappingPreview/styled'

const BackupTokenImg = styled.img.attrs((attrs) => ({ ...attrs, width: '24px' }))`
  filter: invert(1);
`

interface WrapCardProps {
  currency: Currency
  balance?: CurrencyAmount<Currency>
  amountToWrap?: CurrencyAmount<Currency>
  chainId?: number
}

export function WrapCard(props: WrapCardProps) {
  const { balance, amountToWrap, currency, chainId } = props
  const symbol = currency.symbol
  const hasLogoUri = currency.isNative || Boolean(currency instanceof WrappedTokenInfo && currency.logoURI)

  return (
    <styledEl.WrapCardWrapper>
      {/* logo */}
      {!hasLogoUri && chainId && currency.equals(WRAPPED_NATIVE_CURRENCY[chainId]) ? (
        <BackupTokenImg alt="token-img" src={CHAIN_INFO[chainId].logoUrl} />
      ) : (
        <CurrencyLogo currency={currency} size="24px" />
      )}
      {/* amount to wrap/unwrap */}
      <styledEl.BalanceLabel>
        <strong>
          {formatSmartAmount(amountToWrap) || '-'} {symbol}
        </strong>
      </styledEl.BalanceLabel>
      {/* user balance */}
      <styledEl.BalanceLabel>Balance: {formatSmartAmount(balance) || '-'}</styledEl.BalanceLabel>
    </styledEl.WrapCardWrapper>
  )
}
