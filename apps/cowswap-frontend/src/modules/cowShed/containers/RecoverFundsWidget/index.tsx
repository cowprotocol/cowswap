import { atom, useAtom } from 'jotai/index'
import { ReactNode, useCallback, useEffect, useState } from 'react'

import { useNativeTokenBalance } from '@cowprotocol/balances-and-allowances'
import { getCurrencyAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { ButtonPrimary, Loader } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'

import { SelectTokenWidget, useOpenTokenSelectWidget, useSourceChainId } from 'modules/tokensList'

import { useTokenContract } from 'common/hooks/useContract'
import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'

import { NoFunds, Wrapper } from './styled'

import { useRecoverFundsCallback } from '../../hooks/useRecoverFundsCallback'
import { useRecoverFundsFromProxy } from '../../hooks/useRecoverFundsFromProxy'
import { BalanceToRecover } from '../../pure/BalanceToRecover'

const BALANCE_UPDATE_INTERVAL = ms`5s`
const BALANCE_SWR_CFG = { refreshInterval: BALANCE_UPDATE_INTERVAL, revalidateOnFocus: true }

const selectedCurrencyAtom = atom<Currency | undefined>(undefined)

export function RecoverFundsWidget(): ReactNode {
  const [selectedCurrency, setSelectedCurrency] = useAtom(selectedCurrencyAtom)
  const [tokenBalance, setTokenBalance] = useState<CurrencyAmount<Currency> | null>(null)

  const { ErrorModal } = useErrorModal()

  const selectedTokenAddress = selectedCurrency ? getCurrencyAddress(selectedCurrency) : undefined
  const hasBalance = !!tokenBalance?.greaterThan(0)
  const isNativeToken = !!selectedCurrency && getIsNativeToken(selectedCurrency)

  const { contract: erc20Contract } = useTokenContract(selectedTokenAddress)
  const onSelectToken = useOpenTokenSelectWidget()

  const sourceChainId = useSourceChainId()

  const recoverFundsContext = useRecoverFundsFromProxy(selectedTokenAddress, tokenBalance, isNativeToken)

  const { isTxSigningInProgress, proxyAddress } = recoverFundsContext

  const { isLoading: isErc20BalanceLoading } = useSWR(
    !isNativeToken && erc20Contract && proxyAddress && selectedCurrency
      ? [erc20Contract, proxyAddress, selectedCurrency]
      : null,
    async ([erc20Contract, proxyAddress, selectedCurrency]) => {
      const balance = await erc20Contract.balanceOf(proxyAddress)

      setTokenBalance(CurrencyAmount.fromRawAmount(selectedCurrency, balance.toHexString()))
    },
    BALANCE_SWR_CFG,
  )

  const { isLoading: isNativeBalanceLoading, data: nativeTokenBalance } = useNativeTokenBalance(
    isNativeToken ? proxyAddress : undefined,
    sourceChainId,
    BALANCE_SWR_CFG,
  )

  useEffect(() => {
    if (!selectedCurrency || !nativeTokenBalance) return

    setTokenBalance(CurrencyAmount.fromRawAmount(selectedCurrency, nativeTokenBalance.toHexString()))
  }, [selectedCurrency, nativeTokenBalance])

  const isBalanceLoading = isErc20BalanceLoading || isNativeBalanceLoading

  const recoverFunds = useRecoverFundsCallback(recoverFundsContext)

  const onCurrencySelectClick = useCallback(() => {
    onSelectToken(selectedCurrency, undefined, undefined, setSelectedCurrency)
  }, [onSelectToken, selectedCurrency, setSelectedCurrency])

  return (
    <Wrapper>
      <ErrorModal />
      <SelectTokenWidget standalone />

      <div>
        <CurrencySelectButton currency={selectedCurrency} loading={false} onClick={onCurrencySelectClick} />
      </div>

      {selectedTokenAddress ? (
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
      ) : (
        <div></div>
      )}
    </Wrapper>
  )
}
