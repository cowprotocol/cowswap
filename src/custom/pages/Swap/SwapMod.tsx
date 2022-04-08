import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
// import { Trade as V2Trade } from '@uniswap/v2-sdk'
// import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
// import { AdvancedSwapDetails } from 'components/swap/AdvancedSwapDetails'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { MouseoverTooltip /* , MouseoverTooltipContent */ } from 'components/Tooltip'
// import JSBI from 'jsbi'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown, /*, ArrowLeft */ CheckCircle, HelpCircle /* , Info */ } from 'react-feather'
import ReactGA from 'react-ga'
// import { Link, RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { /* styled, */ ThemeContext } from 'styled-components/macro'
import AddressInputPanel from 'components/AddressInputPanel'
import {
  ButtonConfirmed,
  /* ButtonError,
  ButtonGray,
  ButtonLight,
  ButtonPrimary */
} from 'components/Button'
import Card, { GreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import CurrencyLogo from 'components/CurrencyLogo'
import Loader from 'components/Loader'
import { /* Row, */ AutoRow /*, RowFixed */ } from 'components/Row'
// import BetterTradeLink from 'components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import { /* ArrowWrapper, Dots, */ /* SwapCallbackError, */ Wrapper } from 'components/swap/styleds'
import SwapHeader from 'components/swap/SwapHeader'
// import TradePrice from 'components/swap/TradePrice'
// import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import TokenWarningModal from 'components/TokenWarningModal'
import { useAllTokens, useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
// import { V3TradeState } from '../../hooks/useBestV3Trade'
import useENSAddress from 'hooks/useENSAddress'
import { useERC20PermitFromTrade, UseERC20PermitState } from 'hooks/useERC20Permit'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useSwapCallback } from 'hooks/useSwapCallback'
import { /* useToggledVersion, */ Version } from 'hooks/useToggledVersion'
import { useHigherUSDValue /* , useUSDCValue */ } from 'hooks/useUSDCPrice'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { useActiveWeb3React } from 'hooks/web3'
import {
  useCloseModals,
  useModalOpen,
  useOpenModal,
  useWalletModalToggle /*, useToggleSettingsMenu */,
} from 'state/application/hooks'
import { Field } from 'state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
  useDetectNativeToken,
  useIsFeeGreaterThanInput,
  useHighFeeWarning,
  useUnknownImpactWarning,
} from 'state/swap/hooks'
import { useExpertModeManager, useRecipientToggleManager } from 'state/user/hooks'
import { /* HideSmall, */ LinkStyledButton, TYPE, ButtonSize } from 'theme'
// import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
// import { getTradeVersion } from 'utils/getTradeVersion'
// import { isTradeBetter } from 'utils/isTradeBetter'
import { maxAmountSpend } from 'utils/maxAmountSpend'
// import { warningSeverity } from 'utils/prices'
// MOD
import { AMOUNT_PRECISION, INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'constants/index'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import FeeInformationTooltip from 'components/swap/FeeInformationTooltip'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { HashLink } from 'react-router-hash-link'
// import { logTradeDetails } from 'state/swap/utils'
import { useGetQuoteAndStatus } from 'state/price/hooks'
import { SwapProps, ButtonError, ButtonPrimary } from '.' // mod
import TradeGp from 'state/swap/TradeGp'
import AdvancedSwapDetailsDropdown from 'components/swap/AdvancedSwapDetailsDropdown'
import { formatSmart } from 'utils/format'
import { RowSlippage } from 'components/swap/TradeSummary/RowSlippage'
import usePrevious from 'hooks/usePrevious'
import { StyledAppBody } from './styleds'
import { ApplicationModal } from 'state/application/reducer'
import TransactionConfirmationModal, { OperationType } from 'components/TransactionConfirmationModal'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import usePriceImpact from 'hooks/usePriceImpact'
import { useErrorMessage } from 'hooks/useErrorMessageAndModal'
import { GpEther } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import CowSubsidyModal from 'components/CowSubsidyModal'

// MOD - exported in ./styleds to avoid circ dep
// export const StyledInfo = styled(Info)`
//   opacity: 0.4;
//   color: ${({ theme }) => theme.text1};
//   height: 16px;
//   width: 16px;
//   :hover {
//     opacity: 0.8;
//   }
// `

export default function Swap({
  history,
  location,
  TradeBasicDetails,
  EthWethWrapMessage,
  SwitchToWethBtn,
  FeesExceedFromAmountMessage,
  BottomGrouping,
  SwapButton,
  ArrowWrapperLoader,
  Price,
  HighFeeWarning,
  NoImpactWarning,
  FeesDiscount,
  className,
  allowsOffchainSigning,
}: SwapProps) {
  const { account, chainId } = useActiveWeb3React()
  const { isSupportedWallet } = useWalletInfo()
  const loadedUrlParams = useDefaultsFromURLSearch()
  const previousChainId = usePrevious(chainId)

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(
    process.env.REACT_APP_DISABLE_TOKEN_WARNING === 'true'
  )
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // Transaction confirmation modal
  const [operationType, setOperationType] = useState<OperationType>(OperationType.WRAP_ETHER)
  const [transactionConfirmationModalMsg, setTransactionConfirmationModalMsg] = useState<string>()
  const openTransactionConfirmationModalAux = useOpenModal(ApplicationModal.TRANSACTION_CONFIRMATION)
  const closeModals = useCloseModals()
  // const toggleTransactionConfirmation = useToggleTransactionConfirmation()
  const showTransactionConfirmationModal = useModalOpen(ApplicationModal.TRANSACTION_CONFIRMATION)

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
  const showCowSubsidyModal = useModalOpen(ApplicationModal.COW_SUBSIDY)
  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  const [recipientToggleVisible] = useRecipientToggleManager()

  // get version from the url
  // const toggledVersion = useToggledVersion()

  // swap state
  const { independentField, typedValue, recipient, INPUT, OUTPUT } = useSwapState() // MOD: adds INPUT/OUTPUT
  const {
    v2Trade,
    // v3TradeState: { trade: v3Trade, state: v3TradeState },
    // toggledTrade: trade,
    allowedSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(/* toggledVersion */)

  // detects trade load
  const { quote, isGettingNewQuote } = useGetQuoteAndStatus({ token: INPUT.currencyId, chainId })

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

  const tradesByVersion = {
    [Version.v2]: v2Trade,
    // [Version.v3]: v3Trade
  }
  const tradeCurrentVersion = tradesByVersion[Version.v2]

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
  // const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION]

  // const betterTradeLinkV2: Version | undefined =
  //   toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade) ? Version.v2 : undefined

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            // [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            // [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmountWithoutFee,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmountWithoutFee,
          },
    [independentField, parsedAmount, showWrap, trade]
  )

  const priceImpactParams = usePriceImpact({ abTrade: v2Trade, parsedAmounts, isWrapping: !!onWrap })
  const { priceImpact, error: priceImpactError, loading: priceImpactLoading } = priceImpactParams

  const { feeWarningAccepted, setFeeWarningAccepted } = useHighFeeWarning(trade)
  const { impactWarningAccepted, setImpactWarningAccepted } = useUnknownImpactWarning(priceImpactParams)
  // don't show the unknown impact warning on: no trade, wrapping native, no error, or it's loading impact
  const hideUnknownImpactWarning = !trade || !!onWrap || !priceImpactError || priceImpactLoading

  // const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT])
  // const fiatValueOutput = useUSDCValue(parsedAmounts[Field.OUTPUT])
  const fiatValueInput = useHigherUSDValue(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useHigherUSDValue(parsedAmounts[Field.OUTPUT])

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  // const isValid = !swapInputError
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

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    history.push('/swap/')
  }, [history])

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    // tradeToConfirm: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined
    tradeToConfirm: TradeGp | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : formatSmart(parsedAmounts[dependentField], AMOUNT_PRECISION) ?? '',
  }

  /* const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const routeNotFound = !trade?.route
  const isLoadingRoute = toggledVersion === Version.v3 && V3TradeState.LOADING === v3TradeState */

  // check whether the user has approved the router on the input token
  const { approvalState, approve: approveCallback } = useApproveCallbackFromTrade({
    openTransactionConfirmationModal: (message: string) =>
      openTransactionConfirmationModal(message, OperationType.APPROVE_TOKEN),
    closeModals,
    trade,
    allowedSlippage,
  })
  const prevApprovalState = usePrevious(approvalState)
  const {
    state: signatureState,
    // signatureData,
    gatherPermitSignature,
  } = useERC20PermitFromTrade(trade, allowedSlippage)

  const handleApprove = useCallback(async () => {
    let approveRequired = false
    if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
      try {
        await gatherPermitSignature()
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (error?.code !== 4001) {
          approveRequired = true
        }
      }
    } else {
      approveRequired = true
    }

    if (approveRequired) {
      return approveCallback().catch((error) => console.error('Error setting the allowance for token', error))
    }
  }, [approveCallback, gatherPermitSignature, signatureState])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // reset url query on network change
  useEffect(() => {
    if (chainId && previousChainId && chainId !== previousChainId) {
      history.replace(location.pathname)
    }
  }, [chainId, history, location.pathname, previousChainId])

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    } else if (prevApprovalState === ApprovalState.PENDING && approvalState === ApprovalState.NOT_APPROVED) {
      // user canceled the approval tx, reset the UI
      setApprovalSubmitted(false)
    }
  }, [approvalState, approvalSubmitted, prevApprovalState])

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback({
    trade,
    allowedSlippage,
    recipientAddressOrName: recipient,
    openTransactionConfirmationModal: () => {
      setSwapState({
        tradeToConfirm: trade,
        attemptingTxn: true,
        swapErrorMessage: undefined,
        showConfirm: true,
        txHash: undefined,
      })
    },
    //openTransactionConfirmationModal,
    closeModals,
  })

  const handleSwap = useCallback(() => {
    if (!swapCallback) {
      return
    }
    if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })
        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            // getTradeVersion(trade),
            'MH',
          ].join('/'),
        })
      })
      .catch((error) => {
        console.error('Error swapping tokens', error)
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [swapCallback, priceImpact, tradeToConfirm, showConfirm, recipient, recipientAddress, account, trade])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on the greater of fiat value price impact and execution price impact
  /* const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = trade?.priceImpact
    return warningSeverity(
      executionPriceImpact && priceImpact
        ? executionPriceImpact.greaterThan(priceImpact)
          ? executionPriceImpact
          : priceImpact
        : executionPriceImpact ?? priceImpact
    )
  }, [priceImpact, trade]) */

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED))
  // && !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
  }, [maxInputAmount, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )

  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  // const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode

  const [exactInLabel, exactOutLabel] = useMemo(
    () => [
      independentField === Field.OUTPUT && !showWrap && trade ? <Trans>From (incl. fee)</Trans> : null,
      independentField === Field.INPUT && !showWrap && trade ? <Trans>Receive (incl. fee)</Trans> : null,
    ],
    [independentField, showWrap, trade]
  )

  const swapBlankState = !swapInputError && !trade
  let amountBeforeFees: string | undefined
  if (trade) {
    if (trade.tradeType === TradeType.EXACT_INPUT && trade.inputAmountWithFee.lessThan(trade.fee.amount)) {
      amountBeforeFees = '0'
    } else {
      amountBeforeFees = formatSmart(trade.inputAmountWithoutFee, AMOUNT_PRECISION)
    }
  }

  const { ErrorMessage } = useErrorMessage()

  return (
    <>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <TransactionConfirmationModal
        attemptingTxn={true}
        isOpen={showTransactionConfirmationModal}
        pendingText={transactionConfirmationModalMsg}
        onDismiss={closeModals}
        operationType={operationType}
      />
      {/* CoWmunity Fees Discount Modal */}
      <CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} />

      <NetworkAlert />
      <AffiliateStatusCheck />
      <StyledAppBody className={className}>
        <SwapHeader allowedSlippage={allowedSlippage} />
        <Wrapper id="swap-page" className={isExpertMode || recipientToggleVisible ? 'expertMode' : ''}>
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            priceImpact={priceImpact}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap={'md'}>
            <div style={{ display: 'relative' }}>
              <CurrencyInputPanel
                // label={
                //   independentField === Field.OUTPUT && !showWrap ? <Trans>From (at most)</Trans> : <Trans>From</Trans>
                // }
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
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                fiatValue={fiatValueInput ?? undefined}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                showCommonBases
                id="swap-currency-input"
              />
              {/* UNI ARROW SWITCHER */}
              {/*
              <ArrowWrapper clickable>
                <ArrowDown
                  size="16"
                  onClick={() => {
                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                    onSwitchTokens()
                  }}
                  color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.text1 : theme.text3}
                />
              </ArrowWrapper>
              */}
              {/* GP ARROW SWITCHER */}
              <AutoColumn
                justify="space-between"
                style={{ margin: `${isExpertMode || recipientToggleVisible ? 10 : 3}px 0` }}
              >
                <AutoRow
                  justify={isExpertMode || recipientToggleVisible ? 'space-between' : 'center'}
                  // style={{ padding: '0 1rem' }}
                >
                  <ArrowWrapperLoader onSwitchTokens={onSwitchTokens} setApprovalSubmitted={setApprovalSubmitted} />
                  {recipient === null && !showWrap && (isExpertMode || recipientToggleVisible) ? (
                    <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                      <Trans>+ Add a send (optional)</Trans>
                    </LinkStyledButton>
                  ) : null}
                </AutoRow>
              </AutoColumn>
              <CurrencyInputPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                // label={independentField === Field.INPUT && !showWrap ? <Trans>To (at least)</Trans> : <Trans>To</Trans>}
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
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                showCommonBases
                id="swap-currency-output"
              />
            </div>

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowDown size="16" color={theme.text2} />
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    <Trans>- Remove send</Trans>
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}

            {showWrap ? null : (
              /*
              <Row style={{ justifyContent: !trade ? 'center' : 'space-between' }}>
                <RowFixed>
                  {[V3TradeState.VALID, V3TradeState.SYNCING, V3TradeState.NO_ROUTE_FOUND].includes(v3TradeState) &&
                    (toggledVersion === Version.v3 && isTradeBetter(v3Trade, v2Trade) ? (
                      <BetterTradeLink version={Version.v2} otherTradeNonexistent={!v3Trade} />
                    ) : toggledVersion === Version.v2 && isTradeBetter(v2Trade, v3Trade) ? (
                      <BetterTradeLink version={Version.v3} otherTradeNonexistent={!v2Trade} />
                    ) : (
                      toggledVersion === Version.v2 && (
                        <ButtonGray
                          width="fit-content"
                          padding="0.1rem 0.5rem 0.1rem 0.35rem"
                          as={Link}
                          to="/swap"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            height: '24px',
                            lineHeight: '120%',
                            marginLeft: '0.75rem',
                          }}
                        >
                          <ArrowLeft color={theme.text3} size={12} /> &nbsp;
                          <TYPE.main style={{ lineHeight: '120%' }} fontSize={12}>
                            <Trans>
                              <HideSmall>Back to </HideSmall>
                              V3
                            </Trans>
                          </TYPE.main>
                        </ButtonGray>
                      )
                    ))}

                  {toggledVersion === Version.v3 && trade && isTradeBetter(v2Trade, v3Trade) && (
                    <ButtonGray
                      width="fit-content"
                      padding="0.1rem 0.5rem"
                      disabled
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        height: '24px',
                        opacity: 0.8,
                        marginLeft: '0.25rem',
                      }}
                    >
                      <TYPE.black fontSize={12}>
                        <Trans>V3</Trans>
                      </TYPE.black>
                    </ButtonGray>
                  )}
                </RowFixed>
                {trade ? (
                  <RowFixed>
                    <TradePrice
                      price={trade.executionPrice}
                      showInverted={showInverted}
                      setShowInverted={setShowInverted}
                    />
                    <MouseoverTooltipContent
                      content={<AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />}
                    >
                      <StyledInfo />
                    </MouseoverTooltipContent>
                  </RowFixed>
                ) : null}
              </Row>
              */
              <Card padding={showWrap ? '.25rem 1rem 0 1rem' : '0px'} $borderRadius={'20px'}>
                <AutoColumn
                  style={{
                    padding: '0 8px',
                    // gap: 8 // mod
                  }}
                >
                  {trade && (
                    <Price trade={trade} theme={theme} showInverted={showInverted} setShowInverted={setShowInverted} />
                  )}

                  {!isExpertMode && !allowedSlippage.equalTo(INITIAL_ALLOWED_SLIPPAGE_PERCENT) && (
                    // <RowBetween height={24} align="center">
                    //   <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                    //     <Trans>Slippage Tolerance</Trans>
                    //   </ClickableText>
                    //   <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                    //     {formatSmart(allowedSlippage, PERCENTAGE_PRECISION)}%
                    //   </ClickableText>
                    // </RowBetween>
                    <RowSlippage allowedSlippage={allowedSlippage} fontSize={12} fontWeight={400} rowHeight={24} />
                  )}
                  {(isFeeGreater || trade) && fee && <TradeBasicDetails trade={trade} fee={fee} />}
                  {/* FEES DISCOUNT */}
                  {/* TODO: check cow balance and set here, else don't show */}
                  <FeesDiscount theme={theme} onClick={openCowSubsidyModal} />
                </AutoColumn>
                {/* ETH exactIn && wrapCallback returned us cb */}
                {isNativeIn && isSupportedWallet && onWrap && (
                  <EthWethWrapMessage
                    account={account ?? undefined}
                    native={native}
                    nativeInput={nativeInput}
                    wrapped={wrappedToken}
                    wrapCallback={onWrap}
                  />
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
            {swapIsUnsupported ? (
              <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
                <TYPE.main mb="4px">
                  <Trans>Unsupported Token</Trans>
                </TYPE.main>
              </ButtonPrimary>
            ) : !account ? (
              <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={toggleWalletModal}>
                <SwapButton showLoading={swapBlankState || isGettingNewQuote}>Connect Wallet</SwapButton>
              </ButtonPrimary>
            ) : !isSupportedWallet ? (
              <ButtonError buttonSize={ButtonSize.BIG} id="swap-button" disabled={!isSupportedWallet}>
                <Text fontSize={20} fontWeight={500}>
                  <Trans>Wallet Unsupported</Trans>
                </Text>
              </ButtonError>
            ) : showWrap ? (
              <ButtonPrimary
                disabled={Boolean(wrapInputError)}
                onClick={() => onWrap && onWrap().catch((error) => console.error('Error ' + wrapType, error))}
                buttonSize={ButtonSize.BIG}
              >
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? (
                    <Trans>Wrap</Trans>
                  ) : wrapType === WrapType.UNWRAP ? (
                    <Trans>Unwrap</Trans>
                  ) : null)}
              </ButtonPrimary>
            ) : !swapInputError && isNativeIn ? (
              <SwitchToWethBtn wrappedToken={wrappedToken} />
            ) : quote?.error === 'fee-exceeds-sell-amount' ? (
              <FeesExceedFromAmountMessage />
            ) : quote?.error === 'insufficient-liquidity' ? (
              // ) : noRoute && userHasSpecifiedInputOutput ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">
                  <Trans>Insufficient liquidity for this trade.</Trans>
                </TYPE.main>
                {/* {singleHopOnly && <TYPE.main mb="4px">Try enabling multi-hop trades.</TYPE.main>} */}
              </GreyCard>
            ) : quote?.error === 'zero-price' ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">
                  <Trans>Invalid price. Try increasing input/output amount.</Trans>
                </TYPE.main>
                {/* {singleHopOnly && <TYPE.main mb="4px">Try enabling multi-hop trades.</TYPE.main>} */}
              </GreyCard>
            ) : quote?.error === 'transfer-eth-to-smart-contract' ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">
                  <Trans>
                    Buying {GpEther.onChain(chainId || SupportedChainId.MAINNET).symbol} with smart contract wallets is
                    not currently supported
                  </Trans>
                </TYPE.main>
                {/* {singleHopOnly && <TYPE.main mb="4px">Try enabling multi-hop trades.</TYPE.main>} */}
              </GreyCard>
            ) : quote?.error === 'fetch-quote-error' ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">
                  <Trans>Error loading price. Try again later.</Trans>
                </TYPE.main>
              </GreyCard>
            ) : quote?.error === 'offline-browser' ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">Error loading price. You are currently offline.</TYPE.main>
              </GreyCard>
            ) : showApproveFlow ? (
              <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
                <AutoColumn style={{ width: '100%' }} gap="12px">
                  <ButtonConfirmed
                    buttonSize={ButtonSize.BIG}
                    onClick={handleApprove}
                    disabled={
                      approvalState !== ApprovalState.NOT_APPROVED ||
                      approvalSubmitted ||
                      signatureState === UseERC20PermitState.SIGNED
                    }
                    width="100%"
                    marginBottom={10}
                    altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
                    confirmed={
                      approvalState === ApprovalState.APPROVED || signatureState === UseERC20PermitState.SIGNED
                    }
                  >
                    <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }}>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-evenly',
                          width: '100%',
                          fontSize: '13px',
                        }}
                      >
                        <CurrencyLogo currency={currencies[Field.INPUT]} size={'20px'} style={{ flexShrink: 0 }} />
                        {/* we need to shorten this string on mobile */}
                        {approvalState === ApprovalState.APPROVED || signatureState === UseERC20PermitState.SIGNED ? (
                          <Trans>You can now trade {currencies[Field.INPUT]?.symbol}</Trans>
                        ) : (
                          <Trans>Allow CowSwap to use your {currencies[Field.INPUT]?.symbol}</Trans>
                        )}
                        {approvalState === ApprovalState.PENDING ? (
                          <Loader stroke="white" />
                        ) : (approvalSubmitted && approvalState === ApprovalState.APPROVED) ||
                          signatureState === UseERC20PermitState.SIGNED ? (
                          <CheckCircle size="20" color={theme.green1} />
                        ) : (
                          <MouseoverTooltip
                            text={
                              <Trans>
                                You must give the GP smart contracts permission to use your{' '}
                                {currencies[Field.INPUT]?.symbol}. You only have to do this once per token.
                              </Trans>
                            }
                          >
                            <HelpCircle size="20" color={'white'} />
                          </MouseoverTooltip>
                        )}
                      </span>
                    </AutoRow>
                  </ButtonConfirmed>
                  <ButtonError
                    buttonSize={ButtonSize.BIG}
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        })
                      }
                    }}
                    width="100%"
                    id="swap-button"
                    disabled={
                      !isValid ||
                      (approvalState !== ApprovalState.APPROVED && signatureState !== UseERC20PermitState.SIGNED) // || priceImpactTooHigh
                    }
                    // error={isValid && priceImpactSeverity > 2}
                  >
                    <SwapButton showLoading={swapBlankState || isGettingNewQuote}>
                      <Trans>Swap</Trans>
                    </SwapButton>
                    {/* <Text fontSize={16} fontWeight={500}>
                        {priceImpactTooHigh ? (
                          <Trans>High Price Impact</Trans>
                        ) : priceImpactSeverity > 2 ? (
                          <Trans>Swap Anyway</Trans>
                        ) : (
                          <Trans>Swap</Trans>
                        )}
                      </Text> */}
                  </ButtonError>
                </AutoColumn>
              </AutoRow>
            ) : (
              <ButtonError
                buttonSize={ButtonSize.BIG}
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid /*|| priceImpactTooHigh */ || !!swapCallbackError}
                // error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                <SwapButton showLoading={swapBlankState || isGettingNewQuote}>
                  {swapInputError || <Trans>Swap</Trans>}
                </SwapButton>
                {/* <Text fontSize={20} fontWeight={500}>
                    {swapInputError ? (
                      swapInputError
                    ) : priceImpactTooHigh ? (
                      <Trans>Price Impact Too High</Trans>
                    ) : priceImpactSeverity > 2 ? (
                      <Trans>Swap Anyway</Trans>
                    ) : (
                      <Trans>Swap</Trans>
                    )}
                  </Text> */}
              </ButtonError>
            )}
            {isExpertMode ? <ErrorMessage error={swapErrorMessage} /> : null}
          </BottomGrouping>
        </Wrapper>
      </StyledAppBody>
      {/* <SwitchLocaleLink /> */}
      {!swapIsUnsupported ? null : !isSupportedWallet ? (
        <UnsupportedCurrencyFooter
          show={swapIsUnsupported}
          currencies={[currencies[Field.INPUT], currencies[Field.OUTPUT]]}
          showDetailsText="Read more about unsupported wallets"
          detailsText={
            <>
              <p>CowSwap requires offline signatures, which is currently not supported by some wallets.</p>
              <p>
                Read more in the <HashLink to="/faq/protocol#wallet-not-supported">FAQ</HashLink>.
              </p>
            </>
          }
          detailsTitle="This wallet is not yet supported"
        />
      ) : !swapIsUnsupported ? (
        <AdvancedSwapDetailsDropdown trade={trade} allowedSlippage={allowedSlippage} />
      ) : (
        <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
      )}
    </>
  )
}
