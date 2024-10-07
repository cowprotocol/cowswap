import { atom, useAtom } from 'jotai'
import { useCallback, useState } from 'react'

import { getCurrencyAddress, getEtherscanLink } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { BannerOrientation, ButtonPrimary, ExternalLink, InlineBanner, Loader, TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { SelectTokenWidget, useOpenTokenSelectWidget, useUpdateSelectTokenWidgetState } from 'modules/tokensList'

import { useTokenContract } from 'common/hooks/useContract'
import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'
import { NewModal } from 'common/pure/NewModal'

import { Content, ProxyInfo, Wrapper } from './styled'
import { useRescueFundsFromProxy } from './useRescueFundsFromProxy'

const BALANCE_UPDATE_INTERVAL = ms`5s`

const selectedCurrencyAtom = atom<Currency | undefined>(undefined)

export function RescueFundsFromProxy({ onDismiss }: { onDismiss: Command }) {
  const [selectedCurrency, seSelectedCurrency] = useAtom(selectedCurrencyAtom)
  const [tokenBalance, setTokenBalance] = useState<CurrencyAmount<Currency> | null>(null)

  const selectedTokenAddress = selectedCurrency ? getCurrencyAddress(selectedCurrency) : undefined
  const hasBalance = !!tokenBalance?.greaterThan(0)

  const { chainId } = useWalletInfo()
  const { ErrorModal, handleSetError } = useErrorModal()
  const addTransaction = useTransactionAdder()
  const erc20Contract = useTokenContract(selectedTokenAddress)
  const onSelectToken = useOpenTokenSelectWidget()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  const onDismissCallback = useCallback(() => {
    updateSelectTokenWidget({ open: false })
    onDismiss()
  }, [updateSelectTokenWidget, onDismiss])

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
      console.error(e)
      handleSetError(e.message || e.toString())
    }
  }, [rescueFundsCallback, addTransaction, handleSetError])

  const onCurrencySelectClick = useCallback(() => {
    onSelectToken(selectedTokenAddress, seSelectedCurrency)
  }, [onSelectToken, selectedTokenAddress, seSelectedCurrency])

  return (
    <Wrapper>
      <NewModal
        modalMode={false}
        title="Rescue funds from CoW Shed Proxy"
        onDismiss={onDismissCallback}
        contentPadding="10px"
        justifyContent="flex-start"
      >
        <ErrorModal />
        <SelectTokenWidget />
        <InlineBanner orientation={BannerOrientation.Horizontal}>
          <p>
            In some cases, when orders contain a post-hook using a proxy account, something may go wrong and funds may
            remain on the proxy account. Select a currency and get your funds back.
          </p>
        </InlineBanner>
        <ProxyInfo>
          <h4>Proxy account:</h4>
          {proxyAddress && (
            <ExternalLink href={getEtherscanLink(chainId, 'address', proxyAddress)}>
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
      </NewModal>
    </Wrapper>
  )
}
