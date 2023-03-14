import * as styledEl from '@cow/modules/limitOrders/containers/LimitOrdersWidget/styled'
import { TradeWidgetLinks } from '@cow/modules/application/containers/TradeWidgetLinks'
import { CurrencyInputPanel } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import React, { useCallback, useState } from 'react'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { Field } from 'state/swap/actions'
import { Trans } from '@lingui/macro'
import { SwapButton } from '@cow/modules/limitOrders/containers/TradeButtons/limitOrdersTradeButtonsMap'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { formatInputAmount } from '@cow/utils/amountFormat'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import AddressInputPanel from '@src/components/AddressInputPanel'
import { _getClientOrThrow } from '@cow/api/gnosisSafe'
import { useWeb3React } from '@web3-react/core'
import Safe from '@safe-global/safe-core-sdk'
import EthersAdapter from '@safe-global/safe-ethers-lib'
// eslint-disable-next-line no-restricted-imports
import { ethers } from 'ethers'
import { JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers'
import SafeServiceClient from '@safe-global/safe-service-client'
import { SafeTransaction } from '@safe-global/safe-core-sdk-types'

async function proposeTransaction(
  safe: Safe,
  safeService: SafeServiceClient,
  tx: SafeTransaction,
  signer: ethers.Signer
) {
  const safeTxHash = await safe.getTransactionHash(tx)
  const senderSignature = await safe.signTransactionHash(safeTxHash)
  await safeService.proposeTransaction({
    safeAddress: safe.getAddress(),
    safeTransactionData: tx.data,
    safeTxHash,
    senderAddress: await signer.getAddress(),
    senderSignature: senderSignature.data,
  })

  console.log(`Submitted Transaction hash: ${safeTxHash}`)
}

export function TwapWidget() {
  const handlerAddress = '0x87b52ed635df746ca29651581b4d87517aaa9a9f'
  const chainId = 100
  const currenciesLoadingInProgress = false
  const allowsOffchainSigning = false
  const showSetMax = false
  const isRateLoading = false
  const subsidyAndBalance = {
    subsidy: {
      tier: 0,
      discount: 0,
    },
  }

  const { account, provider: library } = useWeb3React()

  const [frequency, setFrequency] = useState<string>('')
  const [deadline, setDeadline] = useState<string>('')

  const [inputCurrency, setInputCurrency] = useState<Currency | null>(WETH[chainId])
  const [outputCurrency, setOutputCurrency] = useState<Currency | null>(null)

  const [inputCurrencyAmount, setInputCurrencyAmount] = useState<CurrencyAmount<Currency> | null>(null)
  const [outputCurrencyAmount, setOutputCurrencyAmount] = useState<CurrencyAmount<Currency> | null>(null)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    viewAmount: formatInputAmount(inputCurrencyAmount),
    rawAmount: inputCurrencyAmount,
    receiveAmountInfo: null,
    currency: inputCurrency,
    balance: null,
    fiatAmount: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    viewAmount: formatInputAmount(outputCurrencyAmount),
    rawAmount: outputCurrencyAmount,
    receiveAmountInfo: null,
    currency: outputCurrency,
    balance: null,
    fiatAmount: null,
  }

  const onCurrencySelection = useCallback((field: Field, currency: Currency) => {
    if (field === Field.INPUT) {
      setInputCurrency(currency)
    } else {
      setOutputCurrency(currency)
    }
  }, [])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      const currency = field === Field.INPUT ? inputCurrency : outputCurrency

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency) || null

      if (field === Field.INPUT) {
        setInputCurrencyAmount(value)
      } else {
        setOutputCurrencyAmount(value)
      }
    },
    [inputCurrency, outputCurrency]
  )
  const onSwitchTokens = useCallback(() => {
    setInputCurrency(outputCurrency)
    setOutputCurrency(inputCurrency)
  }, [inputCurrency, outputCurrency])
  const createOrder = function () {
    console.log('createOrder')
  }

  const bindTwapHandler = useCallback(async () => {
    if (!library || !account) return

    const client = _getClientOrThrow(chainId, library)
    const signer = library.getSigner()

    const provider = new Web3Provider(library.send.bind(library) as JsonRpcFetchFunc)
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: provider.getSigner(0),
    })
    const safe = await Safe.create({ ethAdapter: ethAdapter as any, safeAddress: account })

    const safeTransaction = await safe.createEnableFallbackHandlerTx(handlerAddress)
    await proposeTransaction(safe, client as any, safeTransaction, signer)
  }, [library, account])

  return (
    <>
      <styledEl.Container>
        <styledEl.ContainerBox>
          <styledEl.Header>
            <TradeWidgetLinks />
          </styledEl.Header>

          <CurrencyInputPanel
            id="limit-orders-currency-input"
            disableNonToken={false}
            chainId={chainId}
            loading={currenciesLoadingInProgress}
            onCurrencySelection={onCurrencySelection}
            onUserInput={onUserInput}
            subsidyAndBalance={subsidyAndBalance}
            allowsOffchainSigning={allowsOffchainSigning}
            currencyInfo={inputCurrencyInfo}
            showSetMax={showSetMax}
          />
          <styledEl.CurrencySeparatorBox withRecipient={false}>
            <CurrencyArrowSeparator
              isCollapsed={false}
              onSwitchTokens={onSwitchTokens}
              withRecipient={false}
              isLoading={false}
              hasSeparatorLine={true}
              border={true}
            />
          </styledEl.CurrencySeparatorBox>
          <CurrencyInputPanel
            id="limit-orders-currency-output"
            disableNonToken={false}
            chainId={chainId}
            loading={currenciesLoadingInProgress}
            isRateLoading={isRateLoading}
            onCurrencySelection={onCurrencySelection}
            onUserInput={onUserInput}
            subsidyAndBalance={subsidyAndBalance}
            allowsOffchainSigning={allowsOffchainSigning}
            currencyInfo={outputCurrencyInfo}
            topLabel={outputCurrencyInfo.label}
          />
          <div>
            <AddressInputPanel label="Frequency" placeholder="" value={frequency} onChange={setFrequency} />
            <AddressInputPanel label="Deadline" placeholder="" value={deadline} onChange={setDeadline} />
          </div>
          <div>
            <br />
            <SwapButton id="bind-twap-handler" onClick={bindTwapHandler} disabled={false}>
              <Trans>Bind handler</Trans>
            </SwapButton>
            <br />
            <SwapButton id="twap-trade" onClick={createOrder} disabled={false}>
              <Trans>Create order</Trans>
            </SwapButton>
          </div>
        </styledEl.ContainerBox>
      </styledEl.Container>
    </>
  )
}
