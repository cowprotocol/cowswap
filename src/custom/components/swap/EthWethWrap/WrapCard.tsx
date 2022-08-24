import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { CHAIN_INFO } from 'constants/chainInfo'
import { WRAPPED_NATIVE_CURRENCY } from '@src/custom/constants/tokens'

const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: center;
  margin: 0 0 4px;
  font-size: 13px;
  width: 100%;
`

const WrapCardWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 8px;
  border-radius: 0 6px 6px 0;

  > img {
    width: 32px;
    height: 32px;
    margin: 0 0 14px;
    box-shadow: none;
  }
`

export const WrapCardContainer = styled.div`
  position: relative;
  ${({ theme }) => theme.flexRowNoWrap}
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  margin: 12px 0;
  width: 100%;
  min-height: 140px;
  overflow: hidden;

  > ${WrapCardWrapper} {
    &:nth-of-type(1) {
      background-color: ${({ theme }) => theme.bg1};
    }

    &:nth-of-type(2) {
      color: ${({ theme }) => theme.text2};
      background-color: ${({ theme }) => theme.bg2};
    }

    > ${BalanceLabel}:last-of-type {
      margin: 0;
      font-size: 12px;
    }
  }

  // arrow
  > svg {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    background: ${({ theme }) => theme.white};
    width: 24px;
    height: 24px;
    border-radius: 24px;
    padding: 3px;
  }
`

const BackupTokenImg = styled.img.attrs((attrs) => ({ ...attrs, width: '24px' }))`
  filter: invert(1);
`

interface WrapCardProps {
  symbol: string
  balance?: CurrencyAmount<Currency>
  amountToWrap?: CurrencyAmount<Currency>
  currency: Currency
  chainId?: number
}

export function WrapCard(props: WrapCardProps) {
  const { symbol, balance, amountToWrap, currency, chainId } = props
  const hasLogoUri = currency.isNative || Boolean(currency instanceof WrappedTokenInfo && currency.logoURI)

  return (
    <WrapCardWrapper>
      {/* logo */}
      {!hasLogoUri && chainId && currency.equals(WRAPPED_NATIVE_CURRENCY[chainId]) ? (
        <BackupTokenImg alt="token-img" src={CHAIN_INFO[chainId].logoUrl} />
      ) : (
        <CurrencyLogo currency={currency} size="24px" />
      )}
      {/* amount to wrap/unwrap */}
      <BalanceLabel>
        <strong>
          {formatSmart(amountToWrap, AMOUNT_PRECISION) || '-'} {symbol}
        </strong>
      </BalanceLabel>
      {/* user balance */}
      <BalanceLabel>Balance: {formatSmart(balance, AMOUNT_PRECISION) || '-'}</BalanceLabel>
    </WrapCardWrapper>
  )
}
