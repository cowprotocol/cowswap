import { ReactNode } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenLogo, useTokensByAddressMap } from '@cowprotocol/tokens'
import { ButtonPrimary, ButtonSize, FiatAmount, Loader, TokenSymbol } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useParams } from 'react-router'

import { useUsdAmount } from 'modules/usdAmount'

import { BalanceWrapper, TokenAmountStyled, TokenLogoWrapper, TokenWrapper } from './styled'

export function AccountProxyRecoverPage(): ReactNode {
  const { tokenAddress } = useParams()
  const tokensByAddress = useTokensByAddressMap()
  const { values: balances } = useTokensBalances()

  const tokenKey = tokenAddress?.toLowerCase() || undefined

  const token = !!tokenKey && tokensByAddress[tokenKey]
  const balanceRaw = !!tokenKey && balances[tokenKey]

  const balance = (token && balanceRaw && CurrencyAmount.fromRawAmount(token, balanceRaw.toHexString())) || undefined

  const { value: usdValue } = useUsdAmount(balance)

  const onRecover = (): void => {
    // TODO: add a listener
    console.log('onRecover')
  }

  if (!token || !balanceRaw) return <Loader />

  return (
    <div>
      <TokenWrapper>
        <p>Recoverable balance</p>
        <BalanceWrapper>
          <TokenAmountStyled amount={balance} />
          <TokenLogoWrapper>
            <TokenLogo token={token} size={24} />
            <TokenSymbol token={token} />
          </TokenLogoWrapper>
        </BalanceWrapper>
        <div>
          <FiatAmount amount={usdValue} />
        </div>
      </TokenWrapper>
      <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onRecover}>
        Recover funds
      </ButtonPrimary>
    </div>
  )
}
