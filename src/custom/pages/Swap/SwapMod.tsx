import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from 'styled-components/macro'

import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { AutoRow } from 'components/Row'
import { Wrapper } from 'components/swap/styleds'
import SwapHeader from 'components/swap/SwapHeader'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import { useCloseModals, useModalIsOpen, useOpenModal } from 'state/application/hooks'
import { Field } from 'state/swap/actions'
import {
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
  useIsFeeGreaterThanInput,
  useHighFeeWarning,
  useUnknownImpactWarning,
} from 'state/swap/hooks'
import { useExpertModeManager, useRecipientToggleManager, useUserSlippageTolerance } from 'state/user/hooks'
import { LinkStyledButton } from 'theme'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { AMOUNT_PRECISION, INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'constants/index'
import FeeInformationTooltip from 'components/swap/FeeInformationTooltip'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { formatSmart } from 'utils/format'
import { RowSlippage } from 'components/swap/TradeSummary/RowSlippage'
import usePrevious from 'hooks/usePrevious'
import { StyledAppBody } from './styleds'
import { ApplicationModal } from 'state/application/reducer'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import usePriceImpact from 'hooks/usePriceImpact'
import { useErrorMessage } from 'hooks/useErrorMessageAndModal'
import CowSubsidyModal from 'components/CowSubsidyModal'
import { AlertWrapper } from './styleds'
import { setMaxSellTokensAnalytics } from 'utils/analytics'
import { ImportTokenModal } from './components/ImportTokenModal'
import { CompatibilityIssuesWarning } from './components/CompatibilityIssuesWarning'
import { ConfirmSwapModalSetup, ConfirmSwapModalSetupProps } from 'pages/Swap/components/ConfirmSwapModalSetup'
import { useAtomValue } from 'jotai/utils'
import { swapConfirmAtom } from 'pages/Swap/state/swapConfirmAtom'
import { SwapButton, SwapButtonContext } from 'pages/Swap/components/SwapButton/SwapButton'
import { RemoveRecipient } from 'pages/Swap/components/RemoveRecipient'
import { Price } from './components/Price'
import { TradeBasicDetails } from 'pages/Swap/components/TradeBasicDetails'
import { BottomGrouping } from 'pages/Swap/styled'
import { ArrowWrapperLoader } from 'components/ArrowWrapperLoader'
import { HighFeeWarning, NoImpactWarning } from 'components/SwapWarnings'
import { FeesDiscount } from 'pages/Swap/components/FeesDiscount'
import { RouteComponentProps } from 'react-router-dom'
import EthFlowModal from 'components/swap/EthFlow'
import { useSwapButtonContext } from 'pages/Swap/hooks/useSwapButtonContext'
import { Routes } from 'constants/routes'

export default function Swap({ history, location, className }: RouteComponentProps & { className?: string }) {
  const { account, chainId } = useWeb3React()
  const { isSupportedWallet, allowsOffchainSigning } = useWalletInfo()
  const previousChainId = usePrevious(chainId)
  const theme = useContext(ThemeContext)
  const closeModals = useCloseModals()

  // Cow subsidy modal
  const openCowSubsidyModal = useOpenModal(ApplicationModal.COW_SUBSIDY)
  const showCowSubsidyModal = useModalIsOpen(ApplicationModal.COW_SUBSIDY)

  // Native wrap modals
  const [showNativeWrapModal, setOpenNativeWrapModal] = useState(false)
  const openNativeWrapModal = () => setOpenNativeWrapModal(true)
  const dismissNativeWrapModal = () => setOpenNativeWrapModal(false)

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  const [recipientToggleVisible] = useRecipientToggleManager()

  // swap state
  const { independentField, typedValue, recipient, INPUT } = useSwapState()
  const { v2Trade, allowedSlippage, currencyBalances, parsedAmount, currencies } = useDerivedSwapInfo()
  const userAllowedSlippage = useUserSlippageTolerance()
  const currencyIn = currencies[Field.INPUT]
  const currencyOut = currencies[Field.OUTPUT]

  const isSwapUnsupported = useIsSwapUnsupported(currencyIn, currencyOut)

  // Is fee greater than input?
  const { isFeeGreater, fee } = useIsFeeGreaterThanInput({
    chainId,
    address: INPUT.currencyId,
  })

  // nativeInput only applies to useWrapCallback and any function that is native
  // currency specific - use slippage/fee adjusted native currency for exactOUT orders
  // and direct input for exactIn orders
  const nativeInput = !!(v2Trade?.tradeType === TradeType.EXACT_INPUT)
    ? v2Trade?.inputAmount
    : // else use the slippage + fee adjusted amount
      computeSlippageAdjustedAmounts(v2Trade, allowedSlippage).INPUT

  const wrapType = useWrapType()
  const showWrap = wrapType !== WrapType.NOT_APPLICABLE

  const trade = showWrap ? undefined : v2Trade

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

  const priceImpactParams = usePriceImpact({ abTrade: v2Trade, parsedAmounts, isWrapping: showWrap })
  const { priceImpact, error: priceImpactError, loading: priceImpactLoading } = priceImpactParams

  const { feeWarningAccepted, setFeeWarningAccepted } = useHighFeeWarning(trade)
  const { impactWarningAccepted, setImpactWarningAccepted } = useUnknownImpactWarning(priceImpactParams)
  // don't show the unknown impact warning on: no trade, wrapping native, no error, or it's loading impact
  const hideUnknownImpactWarning = !trade || showWrap || !priceImpactError || priceImpactLoading

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const { ErrorMessage } = useErrorMessage()

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

  const swapButtonContext: SwapButtonContext = useSwapButtonContext({
    feeWarningAccepted,
    impactWarningAccepted,
    approvalSubmitted,
    setApprovalSubmitted,
    openNativeWrapModal,
  })

  const confirmSwapProps: ConfirmSwapModalSetupProps = {
    trade,
    recipient,
    allowedSlippage,
    handleSwap: swapButtonContext.handleSwap,
    priceImpact,
    dismissNativeWrapModal,
  }

  return (
    <>
      {chainId && <ImportTokenModal chainId={chainId} onDismiss={() => history.push(Routes.SWAP)} />}
      {confirmSwapProps && <ConfirmSwapModalSetup {...confirmSwapProps} />}
      {/* CoWmunity Fees Discount Modal */}
      <CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} />

      <AffiliateStatusCheck />

      {/* Native wrapping modal */}
      {showNativeWrapModal && (
        <EthFlowModal
          nativeInput={showWrap ? parsedAmount : nativeInput}
          wrapUnwrapAmount={swapButtonContext.wrapUnwrapAmount}
          // state
          approvalState={swapButtonContext.approveButtonProps.approvalState}
          onDismiss={dismissNativeWrapModal}
          approveCallback={swapButtonContext.approveButtonProps.approveCallback}
        />
      )}

      <StyledAppBody className={className}>
        <SwapHeader allowedSlippage={allowedSlippage} />
        <Wrapper id="swap-page" className={isExpertMode || recipientToggleVisible ? 'expertMode' : ''}>
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
                priceImpact={showWrap ? undefined : priceImpact}
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
                  {trade && <Price trade={trade} />}

                  {!isExpertMode && !allowedSlippage.equalTo(INITIAL_ALLOWED_SLIPPAGE_PERCENT) && (
                    <RowSlippage allowedSlippage={allowedSlippage} fontSize={12} fontWeight={400} rowHeight={24} />
                  )}
                  {(isFeeGreater || trade) && fee && (
                    <TradeBasicDetails
                      allowedSlippage={userAllowedSlippage}
                      isExpertMode={isExpertMode}
                      allowsOffchainSigning={allowsOffchainSigning}
                      trade={trade}
                      fee={fee}
                    />
                  )}
                  {/* FEES DISCOUNT */}
                  {/* TODO: check cow balance and set here, else don't show */}
                  <FeesDiscount theme={theme} onClick={openCowSubsidyModal} />
                </AutoColumn>
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
            <SwapButton {...swapButtonContext} />
            {isExpertMode ? <ErrorMessage error={swapErrorMessage} /> : null}
          </BottomGrouping>
        </Wrapper>
      </StyledAppBody>
      {currencyIn && currencyOut && isSwapUnsupported && (
        <CompatibilityIssuesWarning
          currencyIn={currencyIn}
          currencyOut={currencyOut}
          isSupportedWallet={isSupportedWallet}
        />
      )}
      <AlertWrapper>
        <NetworkAlert />
      </AlertWrapper>
    </>
  )
}
