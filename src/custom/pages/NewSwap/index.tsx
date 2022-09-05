import React, { useCallback, useState } from 'react'
import * as styledEl from './styled'
import { CurrencyInputPanel } from './pureComponents/CurrencyInputPanel'
import { CurrencyArrowSeparator } from './pureComponents/CurrencyArrowSeparator'
import { TradeRates } from './pureComponents/TradeRates'
import {
  useDerivedSwapInfo,
  useHighFeeWarning,
  useSwapActionHandlers,
  useSwapState,
  useUnknownImpactWarning,
} from 'state/swap/hooks'
import { Field } from 'state/swap/actions'
import { useSetupSwapState } from 'pages/NewSwap/hooks/useSetupSwapState'
import { useCurrencyBalance } from '@src/state/connection/hooks'
import { useWeb3React } from '@web3-react/core'
import { CurrencyInfo, NewSwapPageProps } from 'pages/NewSwap/typings'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { swapPagePropsChecker } from 'pages/NewSwap/propsChecker'
import { useGetQuoteAndStatus } from 'state/price/hooks'
import { useSwapCurrenciesAmounts } from 'pages/NewSwap/hooks/useSwapCurrenciesAmounts'
import usePriceImpact from 'hooks/usePriceImpact'
import { formatSmartAmount } from 'utils/format'
import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from 'pages/NewSwap/helpers/tradeReceiveAmount'
import { useSwapFlowContext } from 'pages/Swap/swapFlow/useSwapFlowContext'
import { SwapButton } from 'pages/Swap/components/SwapButton/SwapButton'
import { useSwapButtonContext } from 'pages/NewSwap/hooks/useSwapButtonContext'
import { OperationType } from 'components/TransactionConfirmationModal'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from '@src/state/application/reducer'
import { NewSwapModals, NewSwapModalsProps } from 'pages/NewSwap/modals'
import { ConfirmSwapModalSetupProps } from 'pages/Swap/components/ConfirmSwapModalSetup'
import { EthFlowProps } from 'components/swap/EthFlow'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useSwapConfirmManager } from 'pages/Swap/hooks/useSwapConfirmManager'

const NewSwapPageInner = React.memo(function (props: NewSwapPageProps) {
  const {
    allowedSlippage,
    isGettingNewQuote,
    inputCurrencyInfo,
    outputCurrencyInfo,
    priceImpactParams,
    swapButtonProps,
  } = props

  console.log('SWAP PAGE RENDER: ', props)

  return (
    <styledEl.Container>
      <styledEl.SwapHeaderStyled allowedSlippage={allowedSlippage} />

      <CurrencyInputPanel currencyInfo={inputCurrencyInfo} showSetMax={true} />
      <CurrencyArrowSeparator isLoading={isGettingNewQuote} />
      <CurrencyInputPanel currencyInfo={outputCurrencyInfo} priceImpactParams={priceImpactParams} />
      <TradeRates />
      <SwapButton {...swapButtonProps} />
    </styledEl.Container>
  )
}, swapPagePropsChecker)

export function NewSwapPage() {
  const { chainId, account } = useWeb3React()
  const { INPUT, independentField, recipient } = useSwapState()
  const { allowedSlippage, currencies, v2Trade: trade } = useDerivedSwapInfo()
  const wrapType = useWrapType()
  const parsedAmounts = useSwapCurrenciesAmounts(wrapType)
  const swapFlowContext = useSwapFlowContext()

  const isWrapUnwrapMode = wrapType !== WrapType.NOT_APPLICABLE
  const priceImpactParams = usePriceImpact({
    abTrade: trade,
    parsedAmounts,
    isWrapping: isWrapUnwrapMode,
  })

  const { isGettingNewQuote } = useGetQuoteAndStatus({
    token: currencies.INPUT?.isNative ? currencies.INPUT.wrapped.address : INPUT.currencyId,
    chainId,
  })

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: currencies.INPUT || null,
    viewAmount: formatSmartAmount(parsedAmounts.INPUT) || '',
    balance: useCurrencyBalance(account ?? undefined, currencies.INPUT) || null,
    fiatAmount: useHigherUSDValue(trade?.inputAmountWithoutFee),
    receiveAmountInfo: independentField === Field.OUTPUT && trade ? getInputReceiveAmountInfo(trade) : null,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: currencies.OUTPUT || null,
    viewAmount: formatSmartAmount(parsedAmounts.OUTPUT) || '',
    balance: useCurrencyBalance(account ?? undefined, currencies.OUTPUT) || null,
    fiatAmount: useHigherUSDValue(trade?.outputAmountWithoutFee),
    receiveAmountInfo: independentField === Field.INPUT && trade ? getOutputReceiveAmountInfo(trade) : null,
  }

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  const [swapConfirmMessage, setSwapConfirmMessage] = useState<string>('')
  const [showNativeWrapModal, setOpenNativeWrapModal] = useState(false)
  const [operationType, setOperationType] = useState<OperationType>(OperationType.WRAP_ETHER)

  const openTransactionConfirmationModalAux = useOpenModal(ApplicationModal.TRANSACTION_CONFIRMATION)

  const { feeWarningAccepted, setFeeWarningAccepted } = useHighFeeWarning(trade)
  const { impactWarningAccepted, setImpactWarningAccepted } = useUnknownImpactWarning(priceImpactParams)

  const openSwapConfirmModalCallback = useCallback(
    (message: string, operationType: OperationType) => {
      setSwapConfirmMessage(message)
      setOperationType(operationType)
      openTransactionConfirmationModalAux()
    },
    [setSwapConfirmMessage, openTransactionConfirmationModalAux]
  )
  const openNativeWrapModal = () => setOpenNativeWrapModal(true)
  const dismissNativeWrapModal = () => setOpenNativeWrapModal(false)

  const { onCurrencySelection } = useSwapActionHandlers()
  const { openSwapConfirmModal } = useSwapConfirmManager()
  const handleNativeWrapAndSwap = () => {
    if (!chainId || !trade) throw new Error('Need to be connected')

    onCurrencySelection(Field.INPUT, WRAPPED_NATIVE_CURRENCY[chainId])
    openSwapConfirmModal(trade)
  }

  const swapButtonContext = useSwapButtonContext({
    swapFlowContext,
    feeWarningAccepted,
    impactWarningAccepted,
    approvalSubmitted,
    setApprovalSubmitted,
    openSwapConfirmModalCallback,
    openNativeWrapModal,
  })

  useSetupSwapState()

  const swapPageProps: NewSwapPageProps = {
    swapButtonProps: swapButtonContext,
    allowedSlippage,
    isGettingNewQuote,
    inputCurrencyInfo,
    outputCurrencyInfo,
    priceImpactParams,
  }

  const confirmSwapProps: ConfirmSwapModalSetupProps = {
    trade,
    recipient,
    allowedSlippage,
    handleSwap: swapButtonContext.handleSwap,
    priceImpact: priceImpactParams.priceImpact,
    operationType,
    swapConfirmMessage,
    dismissNativeWrapModal,
  }

  const ethFlowProps: EthFlowProps = {
    nativeInput: parsedAmounts.INPUT,
    wrapUnrapAmount: swapButtonContext.wrapUnrapAmount,
    approvalState: swapButtonContext.approveButtonProps.approvalState,
    openSwapConfirmModalCallback,
    onDismiss: dismissNativeWrapModal,
    approveCallback: swapButtonContext.approveButtonProps.approveCallback,
    openSwapConfirm: handleNativeWrapAndSwap,
  }

  const swapModalsProps: NewSwapModalsProps = {
    showNativeWrapModal,
    confirmSwapProps,
    ethFlowProps,
  }

  return (
    <>
      <NewSwapPageInner {...swapPageProps} />
      <NewSwapModals {...swapModalsProps} />
    </>
  )
}
