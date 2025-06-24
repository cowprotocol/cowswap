import { atom, useAtom } from 'jotai/index'
import { ReactNode, useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { ButtonPrimary, Loader } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'

import {
  SelectTokenWidget,
  useOpenTokenSelectWidget,
  useSelectTokenWidgetState,
  useSourceChainId,
} from 'modules/tokensList'

import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'

import { NoFunds, Wrapper } from './styled'

import { useFetchTokenBalance } from '../../hooks/useFetchTokenBalance'
import { useRecoverFundsCallback } from '../../hooks/useRecoverFundsCallback'
import { useRecoverFundsFromProxy } from '../../hooks/useRecoverFundsFromProxy'
import { BalanceToRecover } from '../../pure/BalanceToRecover'

const selectedCurrencyAtom = atom<Currency | undefined>(undefined)

interface RecoverFundsWidgetProps {
  defaultToken: TokenWithLogo | undefined
}

export function RecoverFundsWidget({ defaultToken: defaultTokenToRefund }: RecoverFundsWidgetProps): ReactNode {
  const [_selectedCurrency, setSelectedCurrency] = useAtom(selectedCurrencyAtom)
  const selectedCurrency = _selectedCurrency ?? defaultTokenToRefund

  const { ErrorModal } = useErrorModal()
  const { open: isSelectTokenWidgetOpen } = useSelectTokenWidgetState()

  const selectedTokenAddress = selectedCurrency ? getCurrencyAddress(selectedCurrency) : undefined
  const isNativeToken = !!selectedCurrency && getIsNativeToken(selectedCurrency)

  const onSelectToken = useOpenTokenSelectWidget()

  const sourceChainId = useSourceChainId()

  const { isLoading: isBalanceLoading, tokenBalance } = useFetchTokenBalance(selectedCurrency, sourceChainId)
  const recoverFundsContext = useRecoverFundsFromProxy(selectedTokenAddress, tokenBalance, isNativeToken)
  const { isTxSigningInProgress } = recoverFundsContext

  const recoverFunds = useRecoverFundsCallback(recoverFundsContext)

  const onCurrencySelectClick = useCallback(() => {
    onSelectToken(selectedCurrency, undefined, undefined, setSelectedCurrency)
  }, [onSelectToken, selectedCurrency, setSelectedCurrency])

  const hasBalance = !!tokenBalance?.greaterThan(0)

  return (
    <Wrapper>
      <ErrorModal />
      <SelectTokenWidget standalone />

      {!isSelectTokenWidgetOpen && (
        <div>
          <CurrencySelectButton currency={selectedCurrency} loading={false} onClick={onCurrencySelectClick} />
        </div>
      )}

      {selectedTokenAddress && (
        <>
          <BalanceToRecover tokenBalance={tokenBalance} isBalanceLoading={isBalanceLoading} />
          {isTxSigningInProgress || hasBalance ? (
            <ButtonPrimary onClick={recoverFunds} disabled={!hasBalance || isTxSigningInProgress}>
              {isTxSigningInProgress ? <Loader /> : 'Recover funds'}
            </ButtonPrimary>
          ) : (
            <NoFunds>No funds to recover</NoFunds>
          )}
        </>
      )}
    </Wrapper>
  )
}
