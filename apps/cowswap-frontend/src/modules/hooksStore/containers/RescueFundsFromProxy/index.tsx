import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

import { useNativeTokenBalance } from '@cowprotocol/balances-and-allowances'
import { getCurrencyAddress, getEtherscanLink, getIsNativeToken } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { BannerOrientation, ButtonPrimary, ExternalLink, InlineBanner, Loader, TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import {
  SelectTokenWidget,
  useOpenTokenSelectWidget,
  useSelectTokenWidgetState,
  useUpdateSelectTokenWidgetState,
} from 'modules/tokensList'

import { useTokenContract } from 'common/hooks/useContract'
import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'
import { NewModal } from 'common/pure/NewModal'

import { Content, ProxyInfo, Wrapper } from './styled'
import { useRescueFundsFromProxy } from './useRescueFundsFromProxy'

const BALANCE_UPDATE_INTERVAL = ms`5s`
const BALANCE_SWR_CFG = { refreshInterval: BALANCE_UPDATE_INTERVAL, revalidateOnFocus: true }

const selectedCurrencyAtom = atom<Currency | undefined>(undefined)

export function RescueFundsFromProxy({ onDismiss }: { onDismiss: Command }) {
  const [selectedCurrency, setSelectedCurrency] = useAtom(selectedCurrencyAtom)
  const [tokenBalance, setTokenBalance] = useState<CurrencyAmount<Currency> | null>(null)

  const selectedTokenAddress = selectedCurrency ? getCurrencyAddress(selectedCurrency) : undefined
  const hasBalance = !!tokenBalance?.greaterThan(0)
  const isNativeToken = !!selectedCurrency && getIsNativeToken(selectedCurrency)

  const { chainId } = useWalletInfo()
  const { ErrorModal, handleSetError } = useErrorModal()
  const addTransaction = useTransactionAdder()
  const erc20Contract = useTokenContract(selectedTokenAddress)
  const onSelectToken = useOpenTokenSelectWidget()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { open: isSelectTokenWidgetOpen } = useSelectTokenWidgetState()

  const onDismissCallback = useCallback(() => {
    updateSelectTokenWidget({ open: false })
    onDismiss()
  }, [updateSelectTokenWidget, onDismiss])

  const {
    callback: rescueFundsCallback,
    isTxSigningInProgress,
    proxyAddress,
  } = useRescueFundsFromProxy(selectedTokenAddress, tokenBalance, isNativeToken)

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
    BALANCE_SWR_CFG,
  )

  useEffect(() => {
    if (!selectedCurrency || !nativeTokenBalance) return

    setTokenBalance(CurrencyAmount.fromRawAmount(selectedCurrency, nativeTokenBalance.toHexString()))
  }, [selectedCurrency, nativeTokenBalance])

  const isBalanceLoading = isErc20BalanceLoading || isNativeBalanceLoading

  const rescueFunds = useCallback(async () => {
    try {
      const txHash = await rescueFundsCallback()

      if (txHash) {
        addTransaction({ hash: txHash, summary: 'Rescue funds from CoW Shed Proxy' })
      }
    } catch (e) {
      console.error(e)
      handleSetError(e.message || e.toString())
    }
  }, [rescueFundsCallback, addTransaction, handleSetError])

  const onCurrencySelectClick = useCallback(() => {
    onSelectToken(selectedTokenAddress, undefined, undefined, setSelectedCurrency)
  }, [onSelectToken, selectedTokenAddress, setSelectedCurrency])

  const etherscanLink = proxyAddress ? getEtherscanLink(chainId, 'address', proxyAddress) : undefined

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
            <p>
              <ExternalLink href="https://github.com/cowdao-grants/cow-shed">CoW Shed</ExternalLink> is a helper
              contract that enhances user experience inside CoW Swap for features like{' '}
              <ExternalLink href="https://docs.cow.fi/cow-protocol/reference/core/intents/hooks">
                CoW Hooks
              </ExternalLink>
              .
            </p>

            <p>
              This contract is deployed only once per account. This account becomes the only owner. CoW Shed will act as
              an intermediary account who will do the trading on your behalf.
            </p>

            <h3>Rescue funds</h3>
            <p>
              Because this contract holds the funds temporarily, it's possible the funds are stuck in some edge cases.
              This tool will help you recover your funds.
            </p>
            <InlineBanner orientation={BannerOrientation.Horizontal}>
              <strong>How do I unstuck my funds in CoW Shed?</strong>
              <ol>
                <li>
                  {etherscanLink ? (
                    <ExternalLink href={etherscanLink}>Check in Etherscan</ExternalLink>
                  ) : (
                    'Check in Etherscan'
                  )}{' '}
                  if your own CoW Shed has any token
                </li>
                <li>Select the token you want to withdraw from CoW Shed</li>
                <li>Withdraw!</li>
              </ol>
            </InlineBanner>
            <ProxyInfo>
              <h4>Proxy account:</h4>
              {etherscanLink && (
                <ExternalLink href={etherscanLink}>
                  <span>{proxyAddress} ↗</span>
                </ExternalLink>
              )}
            </ProxyInfo>
            <Content>
              <CurrencySelectButton currency={selectedCurrency} loading={false} onClick={onCurrencySelectClick} />

              {selectedTokenAddress ? (
                <>
                  <p>
                    Balance to be rescued:
                    <br />
                    {tokenBalance ? (
                      <b>
                        <TokenAmount amount={tokenBalance} defaultValue="0" tokenSymbol={tokenBalance.currency} />
                      </b>
                    ) : isBalanceLoading ? (
                      <Loader />
                    ) : null}
                  </p>
                  <ButtonPrimary onClick={rescueFunds} disabled={!hasBalance || isTxSigningInProgress}>
                    {isTxSigningInProgress ? <Loader /> : hasBalance ? 'Rescue funds' : 'No funds to rescue'}
                  </ButtonPrimary>
                </>
              ) : (
                <div></div>
              )}
            </Content>
          </>
        )}
      </NewModal>
    </Wrapper>
  )
}
