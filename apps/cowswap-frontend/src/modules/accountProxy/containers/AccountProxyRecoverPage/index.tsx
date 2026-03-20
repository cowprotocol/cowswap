import { ReactNode, useCallback, useState } from 'react'

import { useUpdateTokenBalance } from '@cowprotocol/balances-and-allowances'
import { useComponentDestroyedRef } from '@cowprotocol/common-hooks'
import { delay, getIsNativeToken, isFractionFalsy } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenLogo } from '@cowprotocol/tokens'
import { ButtonSize, CenteredDots, FiatAmount, Loader, TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useParams } from 'react-router'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'

import { addChainIdToRoute } from 'modules/trade'
import { useTwapPrototypeProxy } from 'modules/twap'

import { Routes } from 'common/constants/routes'
import { useNavigateBack } from 'common/hooks/useNavigate'

import {
  BalanceWrapper,
  ButtonPrimaryStyled,
  TokenAmountStyled,
  TokenLogoWrapper,
  TokenWrapper,
  Wrapper,
} from './styled'

import { AccountProxyKind, useAccountProxies } from '../../hooks/useAccountProxies'
import { useRecoverFundsCallback } from '../../hooks/useRecoverFundsCallback'
import { RecoverSigningStep, useRecoverFundsFromProxy } from '../../hooks/useRecoverFundsFromProxy'
import { useTokenBalanceAndUsdValue } from '../../hooks/useTokenBalanceAndUsdValue'
import { processRecoverTransaction } from '../../services/processRecoverTransaction'
import { PrototypeAccountProxyRecoverPage } from '../PrototypeAccountProxyRecoverPage/PrototypeAccountProxyRecoverPage.container'

interface StandardAccountProxyRecoverPageProps {
  proxyAddress?: string
  tokenAddress?: string
}

interface StandardRecoverButtonProps {
  txInProgress: boolean
  txSigningStep: RecoverSigningStep | null
  balance: CurrencyAmount<Currency> | null | undefined
  onRecover(): void
}

export function AccountProxyRecoverPage(): ReactNode {
  const { chainId } = useWalletInfo()
  const { proxyAddress, tokenAddress } = useParams()
  const [prototypeTxInProgress, setPrototypeTxInProgress] = useState(false)
  const [prototypeTxSigningStep, setPrototypeTxSigningStep] = useState<RecoverSigningStep | null>(null)
  const proxies = useAccountProxies()
  const selectedProxy = proxies?.find((proxy) => areAddressesEqual(proxy.account, proxyAddress))

  const destroyedRef = useComponentDestroyedRef()
  const { activeTokens, claimableTokens, currentTokens, queueRecoverNotice, withdrawToken } = useTwapPrototypeProxy()
  const prototypeClaimableToken = claimableTokens.find((item) => areAddressesEqual(item.token.address, tokenAddress))
  const prototypeActiveToken = activeTokens.find((item) => areAddressesEqual(item.token.address, tokenAddress))
  const prototypeCurrentToken = currentTokens.find((item) => areAddressesEqual(item.token.address, tokenAddress))
  const prototypeActiveOrderCount = prototypeCurrentToken?.activeOrderIds.length || 0
  const prototypeOrdersLink = addChainIdToRoute(Routes.ADVANCED_ORDERS, chainId?.toString())

  const navigateBack = useNavigateBack()
  const onPrototypeRecover = useCallback(async () => {
    if (!tokenAddress || !prototypeCurrentToken) return

    setPrototypeTxSigningStep(RecoverSigningStep.SIGN_RECOVER_FUNDS)
    await delay(500)

    if (destroyedRef.current) return

    setPrototypeTxSigningStep(RecoverSigningStep.SIGN_TRANSACTION)
    await delay(500)

    if (destroyedRef.current) return

    setPrototypeTxSigningStep(null)
    setPrototypeTxInProgress(true)
    await delay(800)

    if (destroyedRef.current) return

    withdrawToken(tokenAddress)

    if (prototypeActiveOrderCount > 0) {
      queueRecoverNotice(prototypeActiveOrderCount)
    }

    setPrototypeTxInProgress(false)
    navigateBack()
  }, [
    destroyedRef,
    navigateBack,
    prototypeActiveOrderCount,
    prototypeCurrentToken,
    queueRecoverNotice,
    tokenAddress,
    withdrawToken,
  ])

  if (selectedProxy?.kind === AccountProxyKind.TwapPrototype) {
    return (
      <PrototypeAccountProxyRecoverPage
        activeOrderCount={prototypeActiveOrderCount}
        amount={(prototypeCurrentToken || prototypeClaimableToken || prototypeActiveToken)?.amount || undefined}
        canWithdraw={!!prototypeCurrentToken}
        ordersLink={prototypeOrdersLink}
        onRecover={onPrototypeRecover}
        onGoBack={navigateBack}
        txInProgress={prototypeTxInProgress}
        txSigningStep={prototypeTxSigningStep}
      />
    )
  }

  return <StandardAccountProxyRecoverPage proxyAddress={proxyAddress} tokenAddress={tokenAddress} />
}

function StandardAccountProxyRecoverPage({
  proxyAddress,
  tokenAddress,
}: StandardAccountProxyRecoverPageProps): ReactNode {
  const { chainId } = useWalletInfo()
  const [txInProgress, setTxInProgress] = useState(false)
  const navigateBack = useNavigateBack()
  const { balance, usdValue } = useTokenBalanceAndUsdValue(tokenAddress)
  const updateTokenBalance = useUpdateTokenBalance()
  const destroyedRef = useComponentDestroyedRef()

  const proxies = useAccountProxies()
  const proxyVersion = proxies?.find((proxy) => areAddressesEqual(proxy.account, proxyAddress))?.version
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
        () => setTxInProgress(false),
        () => {
          navigateBack()
          tokenAddress && updateTokenBalance(tokenAddress, BigNumber.from(0))
        },
      )
    })
  }, [recoverCallback, destroyedRef, navigateBack, tokenAddress, updateTokenBalance])

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

      <StandardRecoverButton
        balance={balance}
        txInProgress={txInProgress}
        txSigningStep={txSigningStep}
        onRecover={onRecover}
      />
    </Wrapper>
  )
}

function StandardRecoverButton({
  balance,
  txInProgress,
  txSigningStep,
  onRecover,
}: StandardRecoverButtonProps): ReactNode {
  return (
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
  )
}
