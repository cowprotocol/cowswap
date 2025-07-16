import { atom, useAtom } from 'jotai/index'
import { ReactNode, useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { ButtonPrimary, CenteredDots } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useToggleWalletModal } from 'legacy/state/application/hooks'

import {
  SelectTokenWidget,
  useOpenTokenSelectWidget,
  useSelectTokenWidgetState,
  useSourceChainId,
} from 'modules/tokensList'

import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'

import { ConnectWalletButton, NoFunds, Wrapper } from './styled'

import { useFetchTokenBalance } from '../../hooks/useFetchTokenBalance'
import { useRecoverFundsCallback } from '../../hooks/useRecoverFundsCallback'
import { RecoverSigningStep, useRecoverFundsFromProxy } from '../../hooks/useRecoverFundsFromProxy'
import { BalanceToRecover } from '../../pure/BalanceToRecover'

const ButtonPrimaryStyled = styled(ButtonPrimary)`
  &:disabled {
    font-size: 14px;
  }
`

const selectedCurrencyAtom = atom<Currency | undefined>(undefined)

interface RecoverFundsWidgetProps {
  defaultToken: TokenWithLogo | undefined
}

export function RecoverFundsWidget({ defaultToken: defaultTokenToRefund }: RecoverFundsWidgetProps): ReactNode {
  const { account } = useWalletInfo()
  const [_selectedCurrency, setSelectedCurrency] = useAtom(selectedCurrencyAtom)
  const selectedCurrency = _selectedCurrency ?? defaultTokenToRefund

  const toggleWalletModal = useToggleWalletModal()
  const { ErrorModal } = useErrorModal()
  const { open: isSelectTokenWidgetOpen } = useSelectTokenWidgetState()

  const selectedTokenAddress = selectedCurrency ? getCurrencyAddress(selectedCurrency) : undefined
  const isNativeToken = !!selectedCurrency && getIsNativeToken(selectedCurrency)

  const onSelectToken = useOpenTokenSelectWidget()

  const sourceChainId = useSourceChainId()

  const { isLoading: isBalanceLoading, tokenBalance } = useFetchTokenBalance(selectedCurrency, sourceChainId)
  const recoverFundsContext = useRecoverFundsFromProxy(selectedTokenAddress, tokenBalance, isNativeToken)
  const { txSigningStep } = recoverFundsContext

  const recoverFunds = useRecoverFundsCallback(recoverFundsContext)

  const onCurrencySelectClick = useCallback(() => {
    onSelectToken(selectedCurrency, undefined, undefined, setSelectedCurrency)
  }, [onSelectToken, selectedCurrency, setSelectedCurrency])

  const hasBalance = !!tokenBalance?.greaterThan(0)

  return (
    <Wrapper>
      <ErrorModal />
      <SelectTokenWidget standalone />

      {!account ? (
        <div>
          <ConnectWalletButton onClick={toggleWalletModal}>Connect wallet</ConnectWalletButton>
        </div>
      ) : (
        <>
          {!isSelectTokenWidgetOpen && (
            <div>
              <CurrencySelectButton currency={selectedCurrency} loading={false} onClick={onCurrencySelectClick} />
            </div>
          )}

          {selectedTokenAddress && (
            <>
              <BalanceToRecover tokenBalance={tokenBalance} isBalanceLoading={isBalanceLoading} />
              {txSigningStep || hasBalance ? (
                <ButtonPrimaryStyled onClick={recoverFunds} disabled={!hasBalance || !!txSigningStep}>
                  {txSigningStep && (
                    <>
                      {txSigningStep === RecoverSigningStep.SIGN_RECOVER_FUNDS && '1/2 Confirm funds recovering'}
                      {txSigningStep === RecoverSigningStep.SING_TRANSACTION && '2/2 Sign transaction'}
                      <CenteredDots smaller />
                    </>
                  )}
                  {!txSigningStep && 'Recover funds'}
                </ButtonPrimaryStyled>
              ) : (
                <NoFunds>No funds to recover</NoFunds>
              )}
            </>
          )}
        </>
      )}
    </Wrapper>
  )
}
