/* eslint-disable react-hooks/rules-of-hooks */
// TODO: understand why and re-enable rules-of-hooks
import { Trans } from '@lingui/macro'
// import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
// import { Trade as V2Trade } from '@uniswap/v2-sdk'
// import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
// import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown'
import { useWeb3React } from '@web3-react/core'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
// import JSBI from 'jsbi'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
// import ReactGA from 'react-ga4'
// import { RouteComponentProps } from 'react-router-dom'
// import { TradeState } from 'state/routing/types'
import { ThemeContext } from 'styled-components/macro'

import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { AutoRow, RowBetween } from 'components/Row'
import { /*, SwapCallbackError*/ Wrapper } from 'components/swap/styleds'
import SwapHeader from 'components/swap/SwapHeader'
// import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { /*, useApprovalOptimizedTrade*/ useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import useENSAddress from 'hooks/useENSAddress'
// import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useHigherUSDValue /*, useUSDCValue*/ } from 'hooks/useStablecoinPrice'
import useWrapCallback, { /*WrapErrorText, */ WrapType } from 'hooks/useWrapCallback'
import { useCloseModals, useModalIsOpen, useOpenModal } from 'state/application/hooks'
import { Field } from 'state/swap/actions'
import {
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
  useDetectNativeToken,
  useIsFeeGreaterThanInput,
  useHighFeeWarning,
  useUnknownImpactWarning,
} from 'state/swap/hooks'
import { useExpertModeManager, useRecipientToggleManager } from 'state/user/hooks'
import { LinkStyledButton } from 'theme'
// import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { computeSlippageAdjustedAmounts /*, warningSeverity */ } from 'utils/prices'
// import AppBody from 'pages/AppBody'

// MOD imports
import { AMOUNT_PRECISION, INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'constants/index'
import FeeInformationTooltip from 'components/swap/FeeInformationTooltip'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useGetQuoteAndStatus } from 'state/price/hooks'
import { SwapProps } from '.' // mod
import { formatSmart } from 'utils/format'
import { RowSlippage } from 'components/swap/TradeSummary/RowSlippage'
import usePrevious from 'hooks/usePrevious'
import { StyledAppBody } from './styleds'
import { ApplicationModal } from 'state/application/reducer'
import TransactionConfirmationModal, { OperationType } from 'components/TransactionConfirmationModal'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import usePriceImpact from 'hooks/usePriceImpact'
import { useErrorMessage } from 'hooks/useErrorMessageAndModal'
import CowSubsidyModal from 'components/CowSubsidyModal'
import { AlertWrapper } from './styleds' // mod
import { setMaxSellTokensAnalytics } from 'utils/analytics'
import { ImportTokenModal } from './components/ImportTokenModal'
import { CompatibilityIssuesWarning } from './components/CompatibilityIssuesWarning'
import { ConfirmSwapModalSetup, ConfirmSwapModalSetupProps } from 'pages/Swap/components/ConfirmSwapModalSetup'
import { useAtomValue } from 'jotai/utils'
import { swapConfirmAtom } from 'pages/Swap/state/swapConfirmAtom'
import { ApproveButtonProps } from 'pages/Swap/components/ApproveButton'
import { useSwapButtonState } from 'pages/Swap/hooks/useSwapButtonState'
import { SwapButton, SwapButtonProps } from 'pages/Swap/components/SwapButton/SwapButton'
import { RemoveRecipient } from 'pages/Swap/components/RemoveRecipient'
import { useHandleSwap } from 'pages/Swap/hooks/useHandleSwap'
import { Price } from './components/Price'
import { TradeBasicDetails } from 'pages/Swap/components/TradeBasicDetails'
import EthWethWrap from 'components/swap/EthWethWrap'
import { BottomGrouping } from 'pages/Swap/styled'
import { ArrowWrapperLoader } from 'components/ArrowWrapperLoader'
import { HighFeeWarning, NoImpactWarning } from 'components/SwapWarnings'
import { FeesDiscount } from 'pages/Swap/components/FeesDiscount'

export default function Swap({ history, location, className, allowsOffchainSigning }: SwapProps) {
  const { account, chainId } = useWeb3React()
  const { isSupportedWallet } = useWalletInfo()
  const previousChainId = usePrevious(chainId)
  const theme = useContext(ThemeContext)

  // Transaction confirmation modal
  const [operationType, setOperationType] = useState<OperationType>(OperationType.WRAP_ETHER)
  const [transactionConfirmationModalMsg, setTransactionConfirmationModalMsg] = useState<string>()
  const openTransactionConfirmationModalAux = useOpenModal(ApplicationModal.TRANSACTION_CONFIRMATION)
  const closeModals = useCloseModals()
  const showTransactionConfirmationModal = useModalIsOpen(ApplicationModal.TRANSACTION_CONFIRMATION)

  const openTransactionConfirmationModal = useCallback(
    (message: string, operationType: OperationType) => {
      setTransactionConfirmationModalMsg(message)
      setOperationType(operationType)
      openTransactionConfirmationModalAux()
    },
    [setTransactionConfirmationModalMsg, openTransactionConfirmationModalAux]
  )

  // Cow subsidy modal
  const openCowSubsidyModal = useOpenModal(ApplicationModal.COW_SUBSIDY)
  const showCowSubsidyModal = useModalIsOpen(ApplicationModal.COW_SUBSIDY)
  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  const [recipientToggleVisible] = useRecipientToggleManager()

  // swap state
  const { independentField, typedValue, recipient, INPUT, OUTPUT } = useSwapState() // MOD: adds INPUT/OUTPUT
  const {
    v2Trade,
    allowedSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo()
  const currencyIn = currencies[Field.INPUT]
  const currencyOut = currencies[Field.OUTPUT]

  const swapIsUnsupported = useIsSwapUnsupported(currencyIn, currencyOut)

  // detects trade load
  const { quote, isGettingNewQuote } = useGetQuoteAndStatus({
    token: currencies.INPUT?.isNative ? currencies.INPUT.wrapped.address : INPUT.currencyId,
    chainId,
  })

  // Log all trade information
  // logTradeDetails(v2Trade, allowedSlippage)

  // Checks if either currency is native ETH
  // MOD: adds this hook
  const { isNativeIn, native, wrappedToken } = useDetectNativeToken(
    { currency: currencies.INPUT, address: INPUT.currencyId },
    { currency: currencies.OUTPUT, address: OUTPUT.currencyId },
    chainId
  )
  // Is user swapping Eth as From token and not wrapping to WETH?
  const isNativeInSwap = isNativeIn

  // Is fee greater than input?
  const { isFeeGreater, fee } = useIsFeeGreaterThanInput({
    chainId,
    address: INPUT.currencyId,
  })

  const tradeCurrentVersion = v2Trade

  // nativeInput only applies to useWrapCallback and any function that is native
  // currency specific - use slippage/fee adjusted native currency for exactOUT orders
  // and direct input for exactIn orders
  const nativeInput = !!(tradeCurrentVersion?.tradeType === TradeType.EXACT_INPUT)
    ? tradeCurrentVersion?.inputAmount
    : // else use the slippage + fee adjusted amount
      computeSlippageAdjustedAmounts(tradeCurrentVersion, allowedSlippage).INPUT

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(
    openTransactionConfirmationModal,
    closeModals,
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    // if native input !== NATIVE_TOKEN, validation fails
    nativeInput || parsedAmount,
    // should override and get wrapCallback?
    isNativeInSwap
  )
  const showWrap: boolean = !isNativeInSwap && wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)
  const trade = showWrap ? undefined : tradeCurrentVersion

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmountWithoutFee,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmountWithoutFee,
          },
    [independentField, parsedAmount, showWrap, trade]
  )

  const fiatValueInput = useHigherUSDValue(trade?.inputAmountWithoutFee)
  const fiatValueOutput = useHigherUSDValue(trade?.outputAmountWithoutFee)

  const priceImpactParams = usePriceImpact({ abTrade: v2Trade, parsedAmounts, isWrapping: !!onWrap })
  const { priceImpact, error: priceImpactError, loading: priceImpactLoading } = priceImpactParams

  const { feeWarningAccepted, setFeeWarningAccepted } = useHighFeeWarning(trade)
  const { impactWarningAccepted, setImpactWarningAccepted } = useUnknownImpactWarning(priceImpactParams)
  // don't show the unknown impact warning on: no trade, wrapping native, no error, or it's loading impact
  const hideUnknownImpactWarning = !trade || !!onWrap || !priceImpactError || priceImpactLoading

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError && feeWarningAccepted && impactWarningAccepted // mod
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const swapConfirmState = useAtomValue(swapConfirmAtom)

  const { swapErrorMessage } = swapConfirmState

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : formatSmart(parsedAmounts[dependentField], AMOUNT_PRECISION) ?? '',
    }),
    [dependentField, independentField, parsedAmounts, showWrap, typedValue]
  )

  // check whether the user has approved the router on the input token
  const { approvalState, approve: approveCallback } = useApproveCallbackFromTrade({
    openTransactionConfirmationModal: (message: string) =>
      openTransactionConfirmationModal(message, OperationType.APPROVE_TOKEN),
    closeModals,
    trade,
    allowedSlippage,
  })
  const transactionDeadline = useTransactionDeadline()

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // reset url query on network change
  useEffect(() => {
    if (chainId && previousChainId && chainId !== previousChainId) {
      history.replace(location.pathname)
    }
  }, [chainId, history, location.pathname, previousChainId])

  const maxInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyBalances[Field.INPUT]),
    [currencyBalances]
  )
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  const { swapCallback: handleSwap, swapCallbackError } = useHandleSwap({
    trade,
    account,
    recipient,
    recipientAddress,
    priceImpact,
    allowedSlippage,
  })

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
    setMaxSellTokensAnalytics()
  }, [maxInputAmount, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )

  const [exactInLabel, exactOutLabel] = useMemo(
    () => [
      independentField === Field.OUTPUT && !showWrap && trade ? <Trans>From (incl. fee)</Trans> : null,
      independentField === Field.INPUT && !showWrap && trade ? <Trans>Receive (incl. fee)</Trans> : null,
    ],
    [independentField, showWrap, trade]
  )

  let amountBeforeFees: string | undefined
  if (trade) {
    if (trade.tradeType === TradeType.EXACT_INPUT && trade.inputAmountWithFee.lessThan(trade.fee.amount)) {
      amountBeforeFees = '0'
    } else {
      amountBeforeFees = formatSmart(trade.inputAmountWithoutFee, AMOUNT_PRECISION)
    }
  }

  const { ErrorMessage } = useErrorMessage()

  const confirmSwapProps: ConfirmSwapModalSetupProps = {
    trade,
    recipient,
    allowedSlippage,
    handleSwap,
    onUserInput,
    priceImpact,
  }

  const approveButtonProps: ApproveButtonProps = {
    trade,
    currencyIn,
    allowedSlippage,
    transactionDeadline,
    isExpertMode,
    handleSwap,
    isValid,
    approvalState,
    approveCallback,
    approvalSubmitted,
    setApprovalSubmitted,
  }

  const swapButtonState = useSwapButtonState({
    inputCurrencyId: INPUT.currencyId,
    outputCurrencyId: OUTPUT.currencyId,
    currencyIn,
    currencyOut,
    wrapType,
    wrapInputError,
    quoteError: quote?.error,
    inputError: swapInputError,
    approvalState,
    approvalSubmitted,
    feeWarningAccepted,
    impactWarningAccepted,
    isGettingNewQuote,
    swapCallbackError,
    trade,
  })

  const swapButtonProps: SwapButtonProps = {
    swapButtonState,
    approveButtonProps,
    chainId,
    wrappedToken,
    handleSwap,
    onWrap,
    wrapType,
    swapInputError,
  }

  return (
    <>
      {chainId && <ImportTokenModal chainId={chainId} history={history} />}
      <TransactionConfirmationModal
        attemptingTxn={true}
        isOpen={showTransactionConfirmationModal}
        pendingText={transactionConfirmationModalMsg}
        onDismiss={closeModals}
        operationType={operationType}
      />
      {/* CoWmunity Fees Discount Modal */}
      <CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} />

      <AffiliateStatusCheck />
      <StyledAppBody className={className}>
        <SwapHeader allowedSlippage={allowedSlippage} />
        <Wrapper id="swap-page" className={isExpertMode || recipientToggleVisible ? 'expertMode' : ''}>
          <ConfirmSwapModalSetup {...confirmSwapProps} />

          <AutoColumn gap={'md'}>
            <div style={{ display: 'relative' }}>
              <CurrencyInputPanel
                label={
                  exactInLabel && (
                    <FeeInformationTooltip
                      label={exactInLabel}
                      trade={trade}
                      showHelper={independentField === Field.OUTPUT}
                      amountBeforeFees={amountBeforeFees}
                      amountAfterFees={formatSmart(trade?.inputAmountWithFee, AMOUNT_PRECISION)}
                      type="From"
                      feeAmount={trade?.fee?.feeAsCurrency}
                      allowsOffchainSigning={allowsOffchainSigning}
                      fiatValue={fiatValueInput}
                    />
                  )
                }
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={showMaxButton}
                currency={currencies[Field.INPUT] ?? null}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                fiatValue={fiatValueInput ?? undefined}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                showCommonBases={true}
                id="swap-currency-input"
              />
              <AutoColumn
                justify="space-between"
                style={{ margin: `${isExpertMode || recipientToggleVisible ? 10 : 3}px 0` }}
              >
                <AutoRow
                  justify={isExpertMode || recipientToggleVisible ? 'space-between' : 'center'}
                  style={{ padding: '0 1rem' }}
                >
                  <ArrowWrapperLoader onSwitchTokens={onSwitchTokens} setApprovalSubmitted={setApprovalSubmitted} />
                  {recipient === null && !showWrap && (isExpertMode || recipientToggleVisible) ? (
                    <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                      <Trans>+ Add a recipient (optional)</Trans>
                    </LinkStyledButton>
                  ) : null}
                </AutoRow>
              </AutoColumn>
              <CurrencyInputPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                label={
                  exactOutLabel && (
                    <FeeInformationTooltip
                      label={exactOutLabel}
                      trade={trade}
                      showHelper={independentField === Field.INPUT}
                      amountBeforeFees={formatSmart(trade?.outputAmountWithoutFee, AMOUNT_PRECISION)}
                      amountAfterFees={formatSmart(trade?.outputAmount, AMOUNT_PRECISION)}
                      type="To"
                      feeAmount={trade?.outputAmountWithoutFee?.subtract(trade?.outputAmount)}
                      allowsOffchainSigning={allowsOffchainSigning}
                      fiatValue={fiatValueOutput}
                    />
                  )
                }
                showMaxButton={false}
                hideBalance={false}
                fiatValue={fiatValueOutput ?? undefined}
                priceImpact={onWrap ? undefined : priceImpact}
                priceImpactLoading={priceImpactLoading}
                currency={currencies[Field.OUTPUT] ?? null}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                showCommonBases={true}
                id="swap-currency-output"
              />
            </div>

            {recipient !== null && !showWrap ? (
              <RemoveRecipient recipient={recipient} onChangeRecipient={onChangeRecipient} />
            ) : null}
            {!showWrap && (
              <Card padding={showWrap ? '.25rem 1rem 0 1rem' : '0px'} $borderRadius={'20px'}>
                <AutoColumn
                  style={{
                    padding: '0 8px',
                  }}
                >
                  {trade && (
                    <Price trade={trade} theme={theme} showInverted={showInverted} setShowInverted={setShowInverted} />
                  )}

                  {!isExpertMode && !allowedSlippage.equalTo(INITIAL_ALLOWED_SLIPPAGE_PERCENT) && (
                    <RowSlippage allowedSlippage={allowedSlippage} fontSize={12} fontWeight={400} rowHeight={24} />
                  )}
                  {(isFeeGreater || trade) && fee && <TradeBasicDetails trade={trade} fee={fee} />}
                  {/* FEES DISCOUNT */}
                  {/* TODO: check cow balance and set here, else don't show */}
                  <FeesDiscount theme={theme} onClick={openCowSubsidyModal} />
                </AutoColumn>
                {/* ETH exactIn && wrapCallback returned us cb */}
                {isNativeIn && isSupportedWallet && onWrap && (
                  <RowBetween>
                    <EthWethWrap
                      account={account ?? undefined}
                      native={native}
                      nativeInput={nativeInput}
                      wrapped={wrappedToken}
                      wrapCallback={onWrap}
                    />
                  </RowBetween>
                )}
              </Card>
            )}
          </AutoColumn>
          <HighFeeWarning
            trade={trade}
            acceptedStatus={feeWarningAccepted}
            acceptWarningCb={!isExpertMode && account ? () => setFeeWarningAccepted((state) => !state) : undefined}
            width="99%"
            padding="5px 15px"
          />
          <NoImpactWarning
            trade={trade}
            hide={hideUnknownImpactWarning}
            acceptedStatus={impactWarningAccepted}
            acceptWarningCb={!isExpertMode && account ? () => setImpactWarningAccepted((state) => !state) : undefined}
            width="99%"
            padding="5px 15px"
          />
          <BottomGrouping>
            <SwapButton {...swapButtonProps} />
            {isExpertMode ? <ErrorMessage error={swapErrorMessage} /> : null}
          </BottomGrouping>
        </Wrapper>
      </StyledAppBody>
      {currencyIn && currencyOut && (
        <CompatibilityIssuesWarning
          currencyIn={currencyIn}
          currencyOut={currencyOut}
          isSupportedWallet={isSupportedWallet}
          swapIsUnsupported={swapIsUnsupported}
        />
      )}
      <AlertWrapper>
        <NetworkAlert />
      </AlertWrapper>
    </>
  )
}
