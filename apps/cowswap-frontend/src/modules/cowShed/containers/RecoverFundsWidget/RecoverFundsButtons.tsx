import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { getCurrencyAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary, CenteredDots } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { NoFunds } from './styled'

import { useCurrentAccountProxy } from '../../hooks/useCurrentAccountProxy'
import { useFetchTokenBalance } from '../../hooks/useFetchTokenBalance'
import { useRecoverFundsCallback } from '../../hooks/useRecoverFundsCallback'
import { RecoverSigningStep, useRecoverFundsFromProxy } from '../../hooks/useRecoverFundsFromProxy'
import { BalanceToRecover } from '../../pure/BalanceToRecover'

const ButtonPrimaryStyled = styled(ButtonPrimary)`
  &:disabled {
    font-size: 14px;
  }
`

interface RecoverFundsButtonsProps {
  selectedCurrency: Currency | undefined
  sourceChainId: SupportedChainId
}

export function RecoverFundsButtons({ selectedCurrency, sourceChainId }: RecoverFundsButtonsProps): ReactNode {
  const selectedTokenAddress = selectedCurrency ? getCurrencyAddress(selectedCurrency) : undefined
  const isNativeToken = !!selectedCurrency && getIsNativeToken(selectedCurrency)

  const { isLoading: isBalanceLoading, tokenBalance } = useFetchTokenBalance(selectedCurrency, sourceChainId)
  const recoverFundsContext = useRecoverFundsFromProxy(selectedTokenAddress, tokenBalance, isNativeToken)
  const { txSigningStep } = recoverFundsContext

  const recoverFunds = useRecoverFundsCallback(recoverFundsContext)

  const { data: accountProxy, isLoading: accountProxyLoading } = useCurrentAccountProxy()

  const hasBalance = !!tokenBalance?.greaterThan(0)

  if (accountProxyLoading) {
    return (
      <ButtonPrimaryStyled disabled>
        Loading {ACCOUNT_PROXY_LABEL} <CenteredDots smaller />
      </ButtonPrimaryStyled>
    )
  }

  if (accountProxy?.isProxySetupValid === null) {
    return <ButtonPrimaryStyled disabled>Couldn't verify {ACCOUNT_PROXY_LABEL}, please try later</ButtonPrimaryStyled>
  }

  if (selectedTokenAddress) {
    return (
      <>
        <BalanceToRecover tokenBalance={tokenBalance} isBalanceLoading={isBalanceLoading} />
        {txSigningStep || hasBalance ? (
          <ButtonPrimaryStyled onClick={recoverFunds} disabled={!hasBalance || !!txSigningStep}>
            {txSigningStep && (
              <>
                {txSigningStep === RecoverSigningStep.SIGN_RECOVER_FUNDS && '1/2 Confirm funds recovering'}
                {txSigningStep === RecoverSigningStep.SIGN_TRANSACTION && '2/2 Sign transaction'}
                <CenteredDots smaller />
              </>
            )}
            {!txSigningStep && 'Recover funds'}
          </ButtonPrimaryStyled>
        ) : (
          <NoFunds>No funds to recover</NoFunds>
        )}
      </>
    )
  }

  return null
}
