import { atom, useAtom } from 'jotai'
import { ReactNode, useCallback, useEffect, useState } from 'react'

import { useNativeTokenBalance } from '@cowprotocol/balances-and-allowances'
import { getCurrencyAddress, getEtherscanLink, getIsNativeToken } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary, ExternalLink, Loader } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import {
  SelectTokenWidget,
  useOpenTokenSelectWidget,
  useSourceChainId,
  useSelectTokenWidgetState,
  useUpdateSelectTokenWidgetState,
} from 'modules/tokensList'

import { useTokenContract } from 'common/hooks/useContract'
import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'
import { NewModal } from 'common/pure/NewModal'

import { Content, ProxyInfo, Title, Wrapper } from './styled'

import { useRecoverFundsFromProxy } from '../../hooks/useRecoverFundsFromProxy'
import { BalanceToRecover } from '../../pure/BalanceToRecover'
import { CoWShedFAQ } from '../../pure/CoWShedFAQ'

const BALANCE_UPDATE_INTERVAL = ms`5s`
const BALANCE_SWR_CFG = { refreshInterval: BALANCE_UPDATE_INTERVAL, revalidateOnFocus: true }

const selectedCurrencyAtom = atom<Currency | undefined>(undefined)

// eslint-disable-next-line max-lines-per-function,complexity
export function RecoverFundsFromProxy({ onDismiss }: { onDismiss: Command }): ReactNode {
  const [selectedCurrency, setSelectedCurrency] = useAtom(selectedCurrencyAtom)
  const [tokenBalance, setTokenBalance] = useState<CurrencyAmount<Currency> | null>(null)

  const selectedTokenAddress = selectedCurrency ? getCurrencyAddress(selectedCurrency) : undefined
  const hasBalance = !!tokenBalance?.greaterThan(0)
  const isNativeToken = !!selectedCurrency && getIsNativeToken(selectedCurrency)

  const { ErrorModal, handleSetError } = useErrorModal()
  const addTransaction = useTransactionAdder()
  const { contract: erc20Contract, chainId: erc20ChainId } = useTokenContract(selectedTokenAddress)
  const onSelectToken = useOpenTokenSelectWidget()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { open: isSelectTokenWidgetOpen } = useSelectTokenWidgetState()
  const sourceChainId = useSourceChainId()

  const onDismissCallback = useCallback(() => {
    updateSelectTokenWidget({ open: false })
    onDismiss()
  }, [updateSelectTokenWidget, onDismiss])

  const {
    callback: recoverFundsCallback,
    isTxSigningInProgress,
    proxyAddress,
  } = useRecoverFundsFromProxy(selectedTokenAddress, tokenBalance, isNativeToken)

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

  const recoverFunds = useCallback(async () => {
    try {
      const txHash = await recoverFundsCallback()

      if (txHash) {
        addTransaction({ hash: txHash, summary: 'Recover funds from CoW Shed Proxy' })
      }
    } catch (e) {
      console.error(e)
      handleSetError(e.message || e.toString())
    }
  }, [recoverFundsCallback, addTransaction, handleSetError])

  const onCurrencySelectClick = useCallback(() => {
    onSelectToken(selectedCurrency, undefined, undefined, setSelectedCurrency)
  }, [onSelectToken, selectedCurrency, setSelectedCurrency])

  const explorerLink = proxyAddress ? getEtherscanLink(erc20ChainId, 'address', proxyAddress) : undefined

  return (
    <Wrapper>
      <NewModal
        modalMode={false}
        title="CoW Shed"
        onDismiss={onDismissCallback}
        contentPadding="10px"
        justifyContent="flex-start"
      >
        <ErrorModal />
        <SelectTokenWidget />
        {!isSelectTokenWidgetOpen && (
          <>
            <Content>
              <Title>Recover funds</Title>

              <ProxyInfo>
                <h4>Proxy account:</h4>
                {explorerLink && (
                  <ExternalLink href={explorerLink}>
                    <span>{proxyAddress} ↗</span>
                  </ExternalLink>
                )}
              </ProxyInfo>

              <CurrencySelectButton currency={selectedCurrency} loading={false} onClick={onCurrencySelectClick} />

              {selectedTokenAddress ? (
                <>
                  <BalanceToRecover tokenBalance={tokenBalance} isBalanceLoading={isBalanceLoading} />
                  <ButtonPrimary onClick={recoverFunds} disabled={!hasBalance || isTxSigningInProgress}>
                    {isTxSigningInProgress ? (
                      <Loader />
                    ) : hasBalance ? (
                      'Recover funds'
                    ) : (
                      <span className="noFunds">No funds to recover</span>
                    )}
                  </ButtonPrimary>
                </>
              ) : (
                <div></div>
              )}
            </Content>
            <CoWShedFAQ explorerLink={explorerLink} />
          </>
        )}
      </NewModal>
    </Wrapper>
  )
}
