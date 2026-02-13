import { ReactNode, useCallback, useState } from 'react'

import { useUpdateTokenBalance } from '@cowprotocol/balances-and-allowances'
import { useComponentDestroyedRef } from '@cowprotocol/common-hooks'
import { getIsNativeToken, isFractionFalsy } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { ButtonSize, CenteredDots, FiatAmount, Loader, TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useParams } from 'react-router'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'

import { useNavigateBack } from 'common/hooks/useNavigate'

import {
  BalanceWrapper,
  ButtonPrimaryStyled,
  TokenAmountStyled,
  TokenLogoWrapper,
  TokenWrapper,
  Wrapper,
} from './styled'

import { useAccountProxies } from '../../hooks/useAccountProxies'
import { useRecoverFundsCallback } from '../../hooks/useRecoverFundsCallback'
import { RecoverSigningStep, useRecoverFundsFromProxy } from '../../hooks/useRecoverFundsFromProxy'
import { useTokenBalanceAndUsdValue } from '../../hooks/useTokenBalanceAndUsdValue'
import { processRecoverTransaction } from '../../services/processRecoverTransaction'

export function AccountProxyRecoverPage(): ReactNode {
  const { chainId } = useWalletInfo()
  const { proxyAddress, tokenAddress } = useParams()
  const [txInProgress, setTxInProgress] = useState(false)

  const navigateBack = useNavigateBack()
  const { balance, usdValue } = useTokenBalanceAndUsdValue(tokenAddress)
  const destroyedRef = useComponentDestroyedRef()

  const proxies = useAccountProxies()
  const updateTokenBalance = useUpdateTokenBalance()
  const proxyVersion = proxies?.find((p) => areAddressesEqual(p.account, proxyAddress))?.version

  const recoverFundsContext = useRecoverFundsFromProxy(
    proxyAddress,
    proxyVersion,
    tokenAddress,
    balance,
    !!tokenAddress && getIsNativeToken(chainId, tokenAddress),
  )
  const { txSigningStep } = recoverFundsContext

  const { handleSetError, ErrorModal } = useErrorModal()
  const recoverCallback = useRecoverFundsCallback(recoverFundsContext, handleSetError)

  const onRecover = useCallback(() => {
    recoverCallback().then((txHash) => {
      if (!txHash) return

      setTxInProgress(true)

      processRecoverTransaction(
        txHash,
        destroyedRef,
        // When tx is finished (successfully or not)
        () => setTxInProgress(false),
        // When tx is successfully mined
        () => {
          navigateBack()
          tokenAddress && updateTokenBalance(tokenAddress, 0n)
        },
      )
    })
  }, [recoverCallback, navigateBack, updateTokenBalance, tokenAddress, destroyedRef])

  return (
    <Wrapper>
      <ErrorModal />
      <TokenWrapper>
        <span>
          <Trans>Recoverable balance</Trans>
        </span>
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
        disabled={isFractionFalsy(balance) || !!txSigningStep || txInProgress}
        buttonSize={ButtonSize.BIG}
        onClick={onRecover}
      >
        {txInProgress && <Loader />}
        {txSigningStep && !txInProgress && (
          <>
            {txSigningStep === RecoverSigningStep.SIGN_RECOVER_FUNDS && t`1/2 Confirm funds recovering`}
            {txSigningStep === RecoverSigningStep.SIGN_TRANSACTION && t`2/2 Sign transaction`}
            <CenteredDots smaller />
          </>
        )}
        {!txSigningStep && !txInProgress && t`Recover funds`}
      </ButtonPrimaryStyled>
    </Wrapper>
  )
}
