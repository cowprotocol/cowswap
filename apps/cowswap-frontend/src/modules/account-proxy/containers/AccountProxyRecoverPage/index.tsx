import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { ButtonPrimary, ButtonSize, FiatAmount, Loader, TokenSymbol } from '@cowprotocol/ui'

import { useParams } from 'react-router'

import { BalanceWrapper, TokenAmountStyled, TokenLogoWrapper, TokenWrapper } from './styled'

import { useTokenBalanceAndUsdValue } from '../../hooks/useTokenBalanceAndUsdValue'

export function AccountProxyRecoverPage(): ReactNode {
  const { tokenAddress } = useParams()

  const { balance, usdValue } = useTokenBalanceAndUsdValue(tokenAddress)

  const onRecover = (): void => {
    // TODO: add a listener
    console.log('onRecover')
  }

  return (
    <div>
      <TokenWrapper>
        <p>Recoverable balance</p>
        <BalanceWrapper>
          {balance ? (
            <>
              <TokenAmountStyled amount={balance} />
              <TokenLogoWrapper>
                <TokenLogo token={balance.currency} size={24} />
                <TokenSymbol token={balance.currency} />
              </TokenLogoWrapper>
            </>
          ) : (
            <div>
              <Loader />
            </div>
          )}
        </BalanceWrapper>
        <div>
          <FiatAmount amount={usdValue} />
        </div>
      </TokenWrapper>
      <ButtonPrimary disabled={!balance} buttonSize={ButtonSize.BIG} onClick={onRecover}>
        Recover funds
      </ButtonPrimary>
    </div>
  )
}
