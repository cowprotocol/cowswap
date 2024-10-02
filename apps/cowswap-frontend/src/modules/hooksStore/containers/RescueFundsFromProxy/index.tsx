import { atom, useAtom } from 'jotai'
import { useCallback, useState } from 'react'

import { getCurrencyAddress, getEtherscanLink } from '@cowprotocol/common-utils'
import { ExternalLink, Loader, TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useOpenTokenSelectWidget } from 'modules/tokensList'

import { useTokenContract } from 'common/hooks/useContract'
import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'

import { useRescueFundsFromProxy } from './useRescueFundsFromProxy'

const BALANCE_UPDATE_INTERVAL = ms`5s`

const selectedCurrencyAtom = atom<Currency | undefined>(undefined)

export function RescueFundsFromProxy() {
  const [selectedCurrency, seSelectedCurrency] = useAtom(selectedCurrencyAtom)
  const [tokenBalance, setTokenBalance] = useState<CurrencyAmount<Currency> | null>(null)

  const selectedTokenAddress = selectedCurrency ? getCurrencyAddress(selectedCurrency) : undefined

  const { chainId } = useWalletInfo()
  const { ErrorModal, handleSetError } = useErrorModal()
  const addTransaction = useTransactionAdder()
  const erc20Contract = useTokenContract(selectedTokenAddress)
  const onSelectToken = useOpenTokenSelectWidget()

  const {
    callback: rescueFundsCallback,
    isTxSigningInProgress,
    proxyAddress,
  } = useRescueFundsFromProxy(selectedTokenAddress, tokenBalance)

  const { isLoading: isBalanceLoading } = useSWR(
    erc20Contract && proxyAddress && selectedCurrency ? [erc20Contract, proxyAddress, selectedCurrency] : null,
    async ([erc20Contract, proxyAddress, selectedCurrency]) => {
      const balance = await erc20Contract.balanceOf(proxyAddress)

      setTokenBalance(CurrencyAmount.fromRawAmount(selectedCurrency, balance.toHexString()))
    },
    { refreshInterval: BALANCE_UPDATE_INTERVAL, revalidateOnFocus: true },
  )

  const rescueFunds = useCallback(async () => {
    try {
      const txHash = await rescueFundsCallback()

      if (txHash) {
        addTransaction({ hash: txHash, summary: 'Rescue funds from CoW Shed Proxy' })
      }
    } catch (e) {
      handleSetError(e.message || e.toString())
    }
  }, [rescueFundsCallback, addTransaction, handleSetError])

  const onCurrencySelectClick = useCallback(() => {
    onSelectToken(selectedTokenAddress, seSelectedCurrency)
  }, [onSelectToken, selectedTokenAddress, seSelectedCurrency])

  return (
    <div>
      <ErrorModal />
      <p>
        Proxy:{' '}
        {proxyAddress && (
          <ExternalLink href={getEtherscanLink(chainId, 'address', proxyAddress)}>
            <span>{proxyAddress}</span>
          </ExternalLink>
        )}
      </p>
      <CurrencySelectButton currency={selectedCurrency} loading={false} onClick={onCurrencySelectClick} />

      <>
        {selectedTokenAddress && (
          <div>
            <p>
              Balance:{' '}
              {tokenBalance ? (
                <TokenAmount amount={tokenBalance} defaultValue="0" tokenSymbol={tokenBalance.currency} />
              ) : isBalanceLoading ? (
                <Loader />
              ) : null}
            </p>
            {isTxSigningInProgress ? (
              <Loader />
            ) : tokenBalance?.greaterThan(0) ? (
              <button onClick={rescueFunds}>Rescue funds</button>
            ) : (
              <button disabled>No balance</button>
            )}
          </div>
        )}
      </>
    </div>
  )
}
