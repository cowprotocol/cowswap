import { Provider, createStore } from 'jotai'
import React from 'react'

import bungeeIcon from '@cowprotocol/assets/images/bungee-logo.svg'
import { USDC_MAINNET, COW, getChainInfo } from '@cowprotocol/common-const'
import { shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { GlobalCoWDAOStyles, ButtonError, ButtonSize } from '@cowprotocol/ui'
import { CurrencyAmount, Currency, Fraction, Percent, Price } from '@uniswap/sdk-core'

import JSBI from 'jsbi'
import { useFixtureSelect } from 'react-cosmos/client'
import styled from 'styled-components/macro'
import { ThemeProvider } from 'theme'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/types'

import { BodyWrapper } from 'modules/application/containers/App/styled'
import { Container, ContainerBox } from 'modules/trade/containers/TradeWidget/styled'
import { DividerHorizontal } from 'modules/trade/pure/Row/styled'
import { TradeConfirmation } from 'modules/trade/pure/TradeConfirmation'
import { ReceiveAmountInfo } from 'modules/trade/types'
import { usdRawPricesAtom } from 'modules/usdAmount/state/usdRawPricesAtom'

import { CurrencyInputPanel } from 'common/pure/CurrencyInputPanel/CurrencyInputPanel'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'
import { CoWDAOFonts } from 'common/styles/CoWDAOFonts'

import { BridgeFeeType, BridgeProtocolConfig } from '../../types'
import { StopStatusEnum } from '../../utils/status'

import { BridgeRouteBreakdown } from './index'

const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts, 'transparent')

// Helper to create CurrencyAmount from a string value and a token object
const createAmount = <T extends Currency>(currency: T, value: string | number): CurrencyAmount<T> => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  return CurrencyAmount.fromRawAmount<T>(currency, JSBI.BigInt(Math.round(numericValue * 10 ** currency.decimals)))
}

const sharedPriceImpact: PriceImpact = {
  priceImpact: new Percent(10, 10000), // 0.1%
  loading: false,
}

// Define provider configs
const bungeeProviderConfig: BridgeProtocolConfig = {
  icon: bungeeIcon,
  title: 'Bungee Exchange',
  url: 'https://bungee.exchange',
  description: 'Multi-chain bridge and swap protocol',
}

// Get token references
const COW_MAINNET = COW[SupportedChainId.MAINNET]
const COW_GNOSIS = COW[SupportedChainId.GNOSIS_CHAIN]

// Prepare default props that will be used in all fixtures
const defaultProps = {
  // Swap details
  sellCurrencyAmount: createAmount(USDC_MAINNET, '1000'),
  buyCurrencyAmount: createAmount(COW_MAINNET, '3442.423'),
  networkCost: '0.5',
  swapMinReceive: '3425.21',
  swapExpectedToReceive: '3442.423',
  swapMaxSlippage: '0.5',
  // Bridge details
  bridgeSendCurrencyAmount: createAmount(COW_MAINNET, '3442.423'),
  bridgeReceiveCurrencyAmount: createAmount(COW_GNOSIS, '3433.1'),
  bridgeFee: '1.50',
  maxBridgeSlippage: '1',
  estimatedTime: 1200, // 20 minutes in seconds
  recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
  bridgeProvider: bungeeProviderConfig,
  // Display options
  hideBridgeFlowFiatAmount: true, // Hide fiat amount in bridge destination token flow
}

// Create mock USD price data using proper Token objects
const mockUsdPrices = {
  // USDC on Mainnet (lowercase address as key)
  [USDC_MAINNET.address.toLowerCase()]: {
    currency: USDC_MAINNET,
    price: new Fraction(1, 1), // 1:1 with USD
    isLoading: false,
    updatedAt: Date.now(),
  },
  // COW on Mainnet (lowercase address as key)
  [COW_MAINNET.address.toLowerCase()]: {
    currency: COW_MAINNET,
    price: new Fraction(43, 100),
    isLoading: false,
    updatedAt: Date.now(),
  },
  // COW on Gnosis Chain (lowercase address as key)
  [COW_GNOSIS.address.toLowerCase()]: {
    currency: COW_GNOSIS,
    price: new Fraction(43, 100),
    isLoading: false,
    updatedAt: Date.now(),
  },
}

// Create a store with the mock USD prices
const store = createStore()
store.set(usdRawPricesAtom, mockUsdPrices)

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
`

const RateInfoStyled = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
`

const FiatValue = styled.span`
  margin-left: 5px;
  opacity: 0.7;
`

// Reusable wrapper component with Jotai provider for mock USD prices
const BridgeFixtureWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <Wrapper>
      <ThemeProvider />
      <GlobalStyles />{' '}
      <BodyWrapper>
        <Container>
          <ContainerBox>{children}</ContainerBox>
        </Container>{' '}
      </BodyWrapper>
    </Wrapper>
  </Provider>
)

// Create mock Currency for fee amount
const USDC = {
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  isToken: true,
} as Currency

// Bridge route with accordion that shows the full BridgeRouteBreakdown
const BridgeRouteWithAccordion = ({ props, isOpen = false }: { props: typeof defaultProps; isOpen?: boolean }) => {
  const [open, setOpen] = React.useState(isOpen)

  // Create mock currency amount for the fee
  const feeAmount =
    props.bridgeFee === BridgeFeeType.FREE ? createAmount(USDC, '0') : createAmount(USDC, props.bridgeFee)

  return (
    <TradeDetailsAccordion
      rateInfo={
        <RateInfoStyled>
          1 {props.sellCurrencyAmount.currency.symbol} = 3.442 {props.buyCurrencyAmount.currency.symbol}{' '}
          <FiatValue>(≈ $0.43)</FiatValue>
        </RateInfoStyled>
      }
      feeTotalAmount={feeAmount}
      feeUsdTotalAmount={feeAmount} // Pass the feeAmount as USD amount to trigger BridgeAccordionSummary
      open={open}
      onToggle={() => setOpen(!open)}
      bridgeEstimatedTime={props.estimatedTime / 60}
      bridgeProtocol={props.bridgeProvider}
      showBridgeUI={true}
    >
      <BridgeRouteBreakdown {...props} />
    </TradeDetailsAccordion>
  )
}

const TradeFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 480px;
  margin-bottom: 16px;
`

const TradeFormFooter = styled.div`
  margin-top: 16px;
`

// Enhanced SwapForm with CurrencyInputPanel components
const SwapForm = () => {
  // Use original hardcoded string values for SwapForm fixture's internal logic
  const originalSellAmountStr = '1000'
  const originalBuyAmountStr = '3442.423'

  // Create buy currency amount for convenient calculations within the fixture
  const buyAmount = createAmount(COW_MAINNET, originalBuyAmountStr)

  // Create sell currency amount for convenient calculations within the fixture
  const sellAmount = createAmount(USDC_MAINNET, originalSellAmountStr)

  // Network fee in sell currency (USDC)
  const networkFeeInSellCurrency = createAmount(USDC_MAINNET, defaultProps.networkCost)

  // Network fee converted to buy currency (COW)
  const networkFeeInBuyCurrency = createAmount(COW_MAINNET, parseFloat(defaultProps.networkCost) * 2.5) // Estimate conversion

  // Create a quote price
  const quotePrice = new Price({
    baseAmount: sellAmount,
    quoteAmount: buyAmount,
  })

  // Calculate amounts after fees
  const buyAmountAfterFees = createAmount(COW_MAINNET, defaultProps.swapExpectedToReceive)

  // Calculate minimum amount from slippage
  const buyAmountAfterSlippage = createAmount(COW_MAINNET, defaultProps.swapMinReceive)

  // Create receiveAmountInfo for output currency
  const receiveAmountInfo: ReceiveAmountInfo = {
    isSell: true,
    quotePrice,
    costs: {
      networkFee: {
        amountInSellCurrency: networkFeeInSellCurrency,
        amountInBuyCurrency: networkFeeInBuyCurrency,
      },
      partnerFee: {
        amount: createAmount(COW_MAINNET, '0'), // No partner fee in this example
        bps: 0,
      },
    },
    beforeNetworkCosts: {
      sellAmount: sellAmount,
      buyAmount: buyAmount,
    },
    afterNetworkCosts: {
      sellAmount: sellAmount,
      buyAmount: buyAmountAfterFees,
    },
    afterPartnerFees: {
      sellAmount: sellAmount,
      buyAmount: buyAmountAfterFees,
    },
    afterSlippage: {
      sellAmount: sellAmount,
      buyAmount: buyAmountAfterSlippage,
    },
  }

  // Create input (sell) currency data using values from defaultProps
  const sellCurrencyInfo = {
    field: Field.INPUT,
    isIndependent: true,
    receiveAmountInfo: null,
    currency: USDC_MAINNET,
    balance: createAmount(USDC_MAINNET, '10000'), // 10,000 USDC
    amount: sellAmount,
    fiatAmount: sellAmount, // 1:1 for USDC
  }

  // Create output (buy) currency data using values from defaultProps
  const buyCurrencyInfo = {
    field: Field.OUTPUT,
    isIndependent: false,
    receiveAmountInfo,
    currency: COW_MAINNET,
    balance: createAmount(COW_MAINNET, '5000'), // 5,000 COW
    amount: buyAmount,
    fiatAmount: createAmount(USDC_MAINNET, parseFloat(originalBuyAmountStr) * 0.43), // Use original string for calculation
  }

  // Price impact for the trade, now using the shared constant
  const priceImpact = sharedPriceImpact

  // Mock functions
  const onUserInput = () => {
    /* no-op */
  }
  const onCurrencySelection = () => {
    /* no-op */
  }
  const openTokenSelectWidget = () => {
    /* no-op */
  }

  // Subsidy and balance for COW token
  const subsidyAndBalance = {
    subsidy: {
      tier: 0,
      discount: 0,
    },
    balance: buyCurrencyInfo.balance, // Reuse balance from buyCurrencyInfo
  }

  return (
    <BridgeFixtureWrapper>
      <TradeFormContainer>
        {/* From input */}
        <CurrencyInputPanel
          id="swap-from"
          chainId={defaultProps.sellCurrencyAmount.currency.chainId}
          areCurrenciesLoading={false}
          bothCurrenciesSet={true}
          isChainIdUnsupported={false}
          disabled={false}
          showSetMax={true}
          maxBalance={sellCurrencyInfo.balance}
          allowsOffchainSigning={true}
          currencyInfo={sellCurrencyInfo}
          priceImpactParams={priceImpact}
          onCurrencySelection={onCurrencySelection}
          onUserInput={onUserInput}
          openTokenSelectWidget={openTokenSelectWidget}
          topLabel="You pay"
          displayChainName
        />

        {/* To input */}
        <CurrencyInputPanel
          id="swap-to"
          chainId={defaultProps.buyCurrencyAmount.currency.chainId}
          areCurrenciesLoading={false}
          bothCurrenciesSet={true}
          isChainIdUnsupported={false}
          disabled={false}
          inputDisabled={true}
          allowsOffchainSigning={true}
          currencyInfo={buyCurrencyInfo}
          priceImpactParams={priceImpact}
          onCurrencySelection={onCurrencySelection}
          onUserInput={onUserInput}
          openTokenSelectWidget={openTokenSelectWidget}
          topLabel="You receive"
          displayChainName
          subsidyAndBalance={subsidyAndBalance}
        />

        {/* Bridge route breakdown */}
        <BridgeRouteWithAccordion props={defaultProps} isOpen={false} />

        <TradeFormFooter>
          <ButtonError buttonSize={ButtonSize.BIG} onClick={() => {}}>
            Swap
          </ButtonError>
        </TradeFormFooter>
      </TradeFormContainer>
    </BridgeFixtureWrapper>
  )
}

/**
 * SwapConfirmation fixture using TradeConfirmation component to simulate
 * a real trade confirmation screen with the BridgeRouteBreakdown integrated
 */
const SwapConfirmation = () => {
  // State for controlling the accordion's expanded/collapsed state for BridgeRouteBreakdown
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Mock data for TradeConfirmation component
  const inputCurrencyInfo = {
    amount: createAmount(USDC_MAINNET, '1000'),
    fiatAmount: createAmount(USDC_MAINNET, '1000'),
    balance: createAmount(USDC_MAINNET, '10000'),
    label: 'You pay',
  }

  const outputCurrencyInfo = {
    amount: createAmount(COW_MAINNET, '3442'),
    fiatAmount: createAmount(USDC_MAINNET, '1480'), // $0.43 per COW would be ~1479.06. Using provided mock value.
    balance: createAmount(COW_MAINNET, '5000'),
    label: 'You receive',
  }

  // Mock price impact data - Create a proper Percent for priceImpact
  // Now using the shared constant
  const priceImpact = sharedPriceImpact

  // Mock app data for TradeConfirmation
  const appData = 'CoW Bridge Referral'

  const ConfirmationDetailsRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    padding: 0;
  `

  const Label = styled.span`
    color: var(--cow-color-text-opacity-70);
    display: flex;
    align-items: center;
    gap: 4px;
  `

  const RecipientValue = styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--cow-color-text); // from Value
    font-weight: 500; // from Value
  `

  const ChainLogoImg = styled.img`
    width: 16px;
    height: 16px;
  `

  const PriceValue = styled.span`
    display: flex;
    align-items: center;
    color: var(--cow-color-text);
  `

  const MinToReceiveRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    padding: 0 0 10px;
  `

  const MinToReceiveValue = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
  `

  const TokenIconWrapper = styled.div`
    display: inline-flex;
    margin-right: 4px;
  `

  const FiatValueText = styled.span`
    margin-left: 5px;
    opacity: 0.7;
  `

  return (
    <BridgeFixtureWrapper>
      <TradeConfirmation
        onConfirm={() => console.log('Confirmed')}
        onDismiss={() => console.log('Dismissed')}
        account="0x1234...5678"
        ensName={undefined}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        isConfirmDisabled={false}
        priceImpact={priceImpact}
        title="Confirm Swap"
        refreshInterval={15000}
        isPriceStatic={false}
        recipient={defaultProps.recipient}
        buttonText="Confirm"
        appData={appData}
        children={(restContent) => (
          <>
            {/* Price line item */}
            <ConfirmationDetailsRow>
              <Label>Price</Label>
              <PriceValue>
                1 COW = 0.290387 USDC <FiatValueText>(≈ $0.29)</FiatValueText>
              </PriceValue>
            </ConfirmationDetailsRow>

            {/* Route breakdown component with collapsible behavior */}
            <BridgeRouteBreakdown
              {...defaultProps}
              isCollapsible={true}
              isExpanded={isExpanded}
              onExpandToggle={() => setIsExpanded(!isExpanded)}
            />

            {/* Only show these elements when breakdown is NOT expanded */}
            {!isExpanded && (
              <>
                {/* Recipient line item */}
                <ConfirmationDetailsRow>
                  <Label>Recipient</Label>
                  <RecipientValue>
                    <ChainLogoImg
                      src={getChainInfo(defaultProps.buyCurrencyAmount.currency.chainId).logo.light}
                      alt="Chain logo"
                    />
                    {shortenAddress(defaultProps.recipient)} &#8599;
                  </RecipientValue>
                </ConfirmationDetailsRow>

                <DividerHorizontal />

                {/* Min to receive line item */}
                <MinToReceiveRow>
                  <Label>Min. to receive</Label>
                  <MinToReceiveValue>
                    <TokenIconWrapper>
                      <TokenLogo token={defaultProps.buyCurrencyAmount.currency} size={18} />
                      <TokenLogo token={COW_GNOSIS} size={18} />
                    </TokenIconWrapper>
                    3423.83 COW <FiatValueText>(≈ $994.23)</FiatValueText>
                  </MinToReceiveValue>
                </MinToReceiveRow>
              </>
            )}

            {/* Rest of content from TradeConfirmation */}
            {restContent}
          </>
        )}
      />
    </BridgeFixtureWrapper>
  )
}

// Status scenarios for bridge transaction states
type ScenarioKey = 'swapDoneBridgePending' | 'bothDone' | 'bridgeFailed' | 'refundComplete'

interface Scenario {
  label: string
  swapStatus: StopStatusEnum
  bridgeStatus: StopStatusEnum
}

const scenarios: Record<ScenarioKey, Scenario> = {
  swapDoneBridgePending: {
    label: 'Swap Done / Bridge Pending',
    swapStatus: StopStatusEnum.DONE,
    bridgeStatus: StopStatusEnum.PENDING,
  },
  bothDone: { label: 'Swap Done / Bridge Done', swapStatus: StopStatusEnum.DONE, bridgeStatus: StopStatusEnum.DONE },
  bridgeFailed: {
    label: 'Swap Done / Bridge Failed (Refund Started)',
    swapStatus: StopStatusEnum.DONE,
    bridgeStatus: StopStatusEnum.FAILED,
  },
  refundComplete: {
    label: 'Swap Done / Refund Complete',
    swapStatus: StopStatusEnum.DONE,
    bridgeStatus: StopStatusEnum.REFUND_COMPLETE,
  },
}

/**
 * BridgeStatus fixture with scenario selection via Cosmos control panel
 */
function BridgeStatus() {
  // Use Cosmos fixture select to create a dropdown in the control panel
  const [scenarioKey] = useFixtureSelect('scenario', {
    defaultValue: 'swapDoneBridgePending' as ScenarioKey,
    options: ['swapDoneBridgePending', 'bothDone', 'bridgeFailed', 'refundComplete'],
  })

  const [isSwapSectionExpanded, setIsSwapSectionExpanded] = React.useState(false)
  const [isBridgeSectionExpanded, setIsBridgeSectionExpanded] = React.useState(true)

  // Get the current scenario based on selected key
  const scenario = scenarios[scenarioKey as ScenarioKey]

  const StatusTitle = styled.h2`
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 600;
    color: var(--cow-color-text);
  `

  return (
    <BridgeFixtureWrapper>
      <TradeFormContainer>
        <StatusTitle>Bridge Status: {scenario.label}</StatusTitle>
        <BridgeRouteBreakdown
          {...defaultProps}
          hasBackground={true}
          hideRouteHeader={true}
          swapStatus={scenario.swapStatus}
          bridgeStatus={scenario.bridgeStatus}
          isSwapSectionCollapsible={true}
          isSwapSectionExpanded={isSwapSectionExpanded}
          onSwapSectionToggle={() => setIsSwapSectionExpanded(!isSwapSectionExpanded)}
          isBridgeSectionCollapsible={true}
          isBridgeSectionExpanded={isBridgeSectionExpanded}
          onBridgeSectionToggle={() => setIsBridgeSectionExpanded(!isBridgeSectionExpanded)}
        />
      </TradeFormContainer>
    </BridgeFixtureWrapper>
  )
}

export default {
  SwapForm,
  SwapConfirmation,
  BridgeStatus,
}
