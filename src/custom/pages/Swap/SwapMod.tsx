import { CurrencyAmount, /* JSBI, */ Token, /* Trade, */ TradeType } from '@uniswap/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import AddressInputPanel from 'components/AddressInputPanel'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from 'components/Button'
import Card, { GreyCard } from 'components/Card'
import Column, { AutoColumn } from 'components/Column'
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { SwapPoolTabs } from 'components/NavigationTabs'
import { AutoRow, RowBetween } from 'components/Row'
import AdvancedSwapDetailsDropdown from 'components/swap/AdvancedSwapDetailsDropdown'
// import BetterTradeLink, { DefaultVersionLink } from 'components/swap/BetterTradeLink'
// import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import {
  ArrowWrapper,
  // BottomGrouping,
  SwapCallbackError,
  Wrapper
} from 'components/swap/styleds'
import TradePrice from 'components/swap/TradePrice'
import TokenWarningModal from 'components/TokenWarningModal'
import ProgressSteps from 'components/ProgressSteps'
import SwapHeader from 'components/swap/SwapHeader'

import { INITIAL_ALLOWED_SLIPPAGE, DEFAULT_PRECISION } from 'constants/index'
// import { getTradeVersion } from 'data/V1'
import { useActiveWeb3React } from 'hooks'
import { useCurrency, useAllTokens } from 'hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import useENSAddress from 'hooks/useENSAddress'
import { useSwapCallback } from 'hooks/useSwapCallback'
import useToggledVersion, { /* DEFAULT_VERSION, */ Version } from 'hooks/useToggledVersion'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from 'state/application/hooks'
import { Field } from 'state/swap/actions'
import {
  useDetectNativeToken,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
  useIsFeeGreaterThanInput
} from 'state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance, useUserSingleHopOnly } from 'state/user/hooks'
import { LinkStyledButton, ButtonSize, TYPE } from 'theme'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { /*computeTradePriceBreakdown, warningSeverity,*/ computeSlippageAdjustedAmounts } from 'utils/prices'
import AppBody from 'pages/AppBody'
import { ClickableText } from 'pages/Pool/styleds'
import Loader from 'components/Loader'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
// import { isTradeBetter } from 'utils/trades'
import FeeInformationTooltip from 'components/swap/FeeInformationTooltip'
import { SwapProps } from '.'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { HashLink } from 'react-router-hash-link'
import { logTradeDetails } from 'state/swap/utils'
import { isInsufficientLiquidityError } from 'state/price/utils'
import { useGetQuoteAndStatus } from 'state/price/hooks'
import TradeGp from '@src/custom/state/swap/TradeGp'

export default function Swap({
  history,
  FeeGreaterMessage,
  EthWethWrapMessage,
  SwitchToWethBtn,
  FeesExceedFromAmountMessage,
  BottomGrouping,
  SwapButton,
  ArrowWrapperLoader,
  className
}: SwapProps) {
  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId)
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(
    process.env.REACT_APP_DISABLE_TOKEN_WARNING === 'true'
  )
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
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

  const { account, chainId } = useActiveWeb3React()
  const { isSupportedWallet } = useWalletInfo()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  // MOD: adds INPUT/OUTPUT
  const { independentField, typedValue, recipient, INPUT, OUTPUT } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError
  } = useDerivedSwapInfo()

  // detects trade load
  const { quote, isGettingNewQuote } = useGetQuoteAndStatus({ token: INPUT.currencyId, chainId })

  // Log all trade information
  logTradeDetails(v2Trade, allowedSlippage)

  // Checks if either currency is native ETH
  // MOD: adds this hook
  const { isNativeIn, isWrappedOut, native, wrappedToken } = useDetectNativeToken(
    { currency: currencies.INPUT, address: INPUT.currencyId },
    { currency: currencies.OUTPUT, address: OUTPUT.currencyId },
    chainId
  )

  // Is user swapping Eth as From token and not wrapping to WETH?
  const isNativeInSwap = isNativeIn && !isWrappedOut

  // Is fee greater than input?
  const { isFeeGreater, fee } = useIsFeeGreaterThanInput({
    chainId,
    address: INPUT.currencyId
  })

  const toggledVersion = useToggledVersion()
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade
  }
  const tradeCurrentVersion = tradesByVersion[toggledVersion]

  // nativeInput only applies to useWrapCallback and any function that is native
  // currency specific - use slippage/fee adjusted native currency for exactOUT orders
  // and direct input for exactIn orders
  const nativeInput = !!(tradeCurrentVersion?.tradeType === TradeType.EXACT_INPUT)
    ? tradeCurrentVersion.inputAmount
    : // else use the slippage + fee adjusted amount
      computeSlippageAdjustedAmounts(tradeCurrentVersion, allowedSlippage).INPUT

  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
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

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        // [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmountWithFee,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
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
    // tradeToConfirm: Trade | undefined
    tradeToConfirm: TradeGp | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(DEFAULT_PRECISION) ?? ''
  }

  // const route = trade?.route
  // const userHasSpecifiedInputOutput = Boolean(
  //   currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  // )
  // const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  // const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const [singleHopOnly] = useUserSingleHopOnly()

  const handleSwap = useCallback(() => {
    // if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
    //   return
    // }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
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
            trade?.outputAmount?.currency?.symbol
            // getTradeVersion(trade)
          ].join('/')
        })

        ReactGA.event({
          category: 'Routing',
          action: singleHopOnly ? 'Swap with multihop disabled' : 'Swap with multihop enabled'
        })
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [
    // priceImpactWithoutFee,
    swapCallback,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade,
    singleHopOnly
  ])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  // const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED))
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
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const [exactInLabel, exactOutLabel] = useMemo(
    () => [
      independentField === Field.OUTPUT && !showWrap && trade ? 'From (incl. fee)' : 'From',
      independentField === Field.INPUT && !showWrap && trade ? 'To (incl. fee)' : 'To'
    ],
    [independentField, showWrap, trade]
  )

  const swapBlankState = !swapInputError && !trade

  return (
    <>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <SwapPoolTabs active={'swap'} />
      <AppBody className={className}>
        <SwapHeader />
        <Wrapper id="swap-page" className={isExpertMode ? 'expertMode' : ''}>
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn
          // gap={'sm'}
          >
            <CurrencyInputPanel
              label={
                <FeeInformationTooltip
                  label={exactInLabel}
                  trade={trade}
                  showHelper={independentField === Field.OUTPUT}
                  amountBeforeFees={trade?.inputAmountWithFee
                    .subtract(trade.fee.feeAsCurrency)
                    .toSignificant(DEFAULT_PRECISION)}
                  amountAfterFees={trade?.inputAmountWithFee.toSignificant(DEFAULT_PRECISION)}
                  type="From"
                  feeAmount={trade?.fee?.feeAsCurrency?.toSignificant(DEFAULT_PRECISION)}
                />
              }
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />
            <AutoColumn justify="space-between">
              <AutoRow
                justify={isExpertMode ? 'space-between' : 'center'}
                // style={{ padding: '0 1rem' }}
              >
                {/* <ArrowWrapper clickable>
                  <ArrowDown
                    size="16"
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                  />
                  </ArrowWrapper> */}

                <ArrowWrapperLoader onSwitchTokens={onSwitchTokens} setApprovalSubmitted={setApprovalSubmitted} />
                {recipient === null && !showWrap && isExpertMode ? (
                  <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    + Add a send (optional)
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={
                <FeeInformationTooltip
                  label={exactOutLabel}
                  trade={trade}
                  showHelper={independentField === Field.INPUT}
                  amountBeforeFees={trade?.outputAmountWithoutFee?.toSignificant(DEFAULT_PRECISION)}
                  amountAfterFees={trade?.outputAmount.toSignificant(DEFAULT_PRECISION)}
                  type="To"
                  feeAmount={trade?.outputAmountWithoutFee
                    ?.subtract(trade?.outputAmount)
                    .toSignificant(DEFAULT_PRECISION)}
                />
              }
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}

            {showWrap ? null : (
              <Card padding={showWrap ? '.25rem 1rem 0 1rem' : '0px'} borderRadius={'20px'}>
                <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
                  {Boolean(trade) && (
                    <RowBetween align="center">
                      <Text fontWeight={500} fontSize={14} color={theme.text2}>
                        Price
                      </Text>
                      <TradePrice
                        price={trade?.executionPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    </RowBetween>
                  )}
                  {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                    <RowBetween align="center">
                      <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        Slippage Tolerance
                      </ClickableText>
                      <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        {allowedSlippage / 100}%
                      </ClickableText>
                    </RowBetween>
                  )}
                  {isFeeGreater && fee && <FeeGreaterMessage fee={fee} />}
                </AutoColumn>
                {/* ETH exactIn && wrapCallback returned us cb */}
                {isNativeIn && onWrap && (
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
          <BottomGrouping>
            {swapIsUnsupported ? (
              <ButtonPrimary buttonSize={ButtonSize.BIG} disabled={true}>
                <TYPE.main mb="4px">Unsupported Token</TYPE.main>
              </ButtonPrimary>
            ) : !account ? (
              <ButtonLight buttonSize={ButtonSize.BIG} onClick={toggleWalletModal}>
                Connect Wallet
              </ButtonLight>
            ) : !isSupportedWallet ? (
              <ButtonError buttonSize={ButtonSize.BIG} id="swap-button" disabled={!isSupportedWallet}>
                <Text fontSize={20} fontWeight={500}>
                  Wallet not supported
                </Text>
              </ButtonError>
            ) : showWrap ? (
              <ButtonPrimary buttonSize={ButtonSize.BIG} disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
              </ButtonPrimary>
            ) : !swapInputError && isNativeIn ? (
              <SwitchToWethBtn wrappedToken={wrappedToken} />
            ) : isFeeGreater ? (
              <FeesExceedFromAmountMessage />
            ) : isInsufficientLiquidityError(quote?.error) ? (
              // ) : noRoute && userHasSpecifiedInputOutput ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
                {singleHopOnly && <TYPE.main mb="4px">Try enabling multi-hop trades.</TYPE.main>}
              </GreyCard>
            ) : showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  buttonSize={ButtonSize.BIG}
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving{' '}
                      <Loader
                      // stroke="white"
                      />
                    </AutoRow>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + currencies[Field.INPUT]?.symbol
                  )}
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
                        txHash: undefined
                      })
                    }
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={
                    !isValid || approval !== ApprovalState.APPROVED // || (priceImpactSeverity > 3 && !isExpertMode)
                  }
                  // error={isValid && priceImpactSeverity > 2}
                >
                  <SwapButton showLoading={swapBlankState || isGettingNewQuote}>Swap</SwapButton>
                  {/* <Text fontSize={16} fontWeight={500}>
                    {priceImpactSeverity > 3 && !isExpertMode
                      ? `Price Impact High`
                      : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                    Swap
                  </Text> */}
                </ButtonError>
              </RowBetween>
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
                      txHash: undefined
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid /*|| (priceImpactSeverity > 3 && !isExpertMode) */ || !!swapCallbackError}
                // error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                <SwapButton showLoading={swapBlankState || isGettingNewQuote}>{swapInputError || 'Swap'}</SwapButton>
                {/* <Text fontSize={20} fontWeight={500}>
                  {swapInputError ? swapInputError : 'Swap'
                  // : priceImpactSeverity > 3 && !isExpertMode
                  // ? `Price Impact Too High`
                  // : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`
                  }
                </Text> */}
              </ButtonError>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
              </Column>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            {/* betterTradeLinkV2 && !swapIsUnsupported && toggledVersion === Version.v1 ? (
              <BetterTradeLink version={betterTradeLinkV2} />
            ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
              <DefaultVersionLink />
            ) : null */}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
      {!isSupportedWallet ? (
        <UnsupportedCurrencyFooter
          show={!isSupportedWallet}
          showDetailsText="Read more about unsupported wallets"
          detailsText={
            <>
              <p>CowSwap requires offline signatures, which is currently not supported by some wallets.</p>
              <p>
                Read more in the <HashLink to="/faq#wallet-not-supported">FAQ</HashLink>.
              </p>
            </>
          }
          detailsTitle="This wallet is not yet supported"
        />
      ) : !swapIsUnsupported ? (
        <AdvancedSwapDetailsDropdown trade={trade} />
      ) : (
        <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
      )}
    </>
  )
}
