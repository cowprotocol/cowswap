import { ReactNode } from 'react'

import { areAddressesEqual, getIsNativeToken, isFractionFalsy } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { ButtonSize, CenteredDots, FiatAmount, Loader, TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useParams } from 'react-router'

import { BalanceWrapper, ButtonPrimaryStyled, TokenAmountStyled, TokenLogoWrapper, TokenWrapper } from './styled'

import { useAccountProxies } from '../../hooks/useAccountProxies'
import { useRecoverFundsCallback } from '../../hooks/useRecoverFundsCallback'
import { RecoverSigningStep, useRecoverFundsFromProxy } from '../../hooks/useRecoverFundsFromProxy'
import { useTokenBalanceAndUsdValue } from '../../hooks/useTokenBalanceAndUsdValue'

export function AccountProxyRecoverPage(): ReactNode {
  const { chainId } = useWalletInfo()
  const { proxyAddress, tokenAddress } = useParams()

  const { balance, usdValue } = useTokenBalanceAndUsdValue(tokenAddress)

  const proxies = useAccountProxies()
  const proxyVersion = proxies?.find((p) => areAddressesEqual(p.account, proxyAddress))?.version

  const recoverFundsContext = useRecoverFundsFromProxy(
    proxyAddress,
    proxyVersion,
    tokenAddress,
    balance,
    !!tokenAddress && getIsNativeToken(chainId, tokenAddress),
  )
  const { txSigningStep } = recoverFundsContext

  const onRecover = useRecoverFundsCallback(recoverFundsContext)

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

      <ButtonPrimaryStyled
        disabled={isFractionFalsy(balance) || !!txSigningStep}
        buttonSize={ButtonSize.BIG}
        onClick={onRecover}
      >
        {txSigningStep && (
          <>
            {txSigningStep === RecoverSigningStep.SIGN_RECOVER_FUNDS && '1/2 Confirm funds recovering'}
            {txSigningStep === RecoverSigningStep.SIGN_TRANSACTION && '2/2 Sign transaction'}
            <CenteredDots smaller />
          </>
        )}
        {!txSigningStep && 'Recover funds'}
      </ButtonPrimaryStyled>
    </div>
  )
}
