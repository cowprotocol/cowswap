import { Provider, createStore } from 'jotai'
import React from 'react'

import bungeeIcon from '@cowprotocol/assets/images/bungee-logo.svg'
import { USDC_MAINNET, COW } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { GlobalCoWDAOStyles } from '@cowprotocol/ui'
import { CurrencyAmount, Currency, Fraction } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'
import { ThemeProvider } from 'theme'

import { BodyWrapper } from 'modules/application/containers/App/styled'
import { Container, ContainerBox } from 'modules/trade/containers/TradeWidget/styled'
import { usdRawPricesAtom } from 'modules/usdAmount/state/usdRawPricesAtom'

import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'
import { CoWDAOFonts } from 'common/styles/CoWDAOFonts'

import { BridgeRouteBreakdown } from './BridgeRouteBreakdown'

import { BridgeFeeType, BridgeProtocolConfig } from '../types'

const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts, 'transparent')

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
  sellAmount: '1000',
  sellToken: 'USDC',
  sellTokenAddress: USDC_MAINNET.address, // Mainnet USDC
  buyAmount: '3442.423',
  buyToken: 'COW',
  buyTokenAddress: COW_MAINNET.address, // Mainnet COW
  networkCost: '0.5',
  networkCostUsd: '0.45',
  swapMinReceive: '3425.21',
  swapExpectedToReceive: '3442.423',
  swapMaxSlippage: '0.5',
  // Bridge details
  bridgeAmount: '3442.423',
  bridgeToken: 'COW',
  bridgeTokenAddress: COW_MAINNET.address, // Mainnet COW
  bridgeTokenReceiveAddress: COW_GNOSIS.address, // Gnosis Chain COW
  bridgeReceiveAmount: '3433.1',
  bridgeFee: '1.50',
  maxBridgeSlippage: '1',
  estimatedTime: 1200, // 20 minutes in seconds
  recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
  bridgeProvider: bungeeProviderConfig,
  // Chain IDs
  sourceChainId: SupportedChainId.MAINNET,
  recipientChainId: SupportedChainId.GNOSIS_CHAIN,
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
    price: new Fraction(43, 100), // $0.43 per COW
    isLoading: false,
    updatedAt: Date.now(),
  },
  // COW on Gnosis Chain (lowercase address as key)
  [COW_GNOSIS.address.toLowerCase()]: {
    currency: COW_GNOSIS,
    price: new Fraction(43, 100), // $0.43 per COW
    isLoading: false,
    updatedAt: Date.now(),
  },
}

// Create a store with the mock USD prices
const store = createStore()
store.set(usdRawPricesAtom, mockUsdPrices)

// Styled wrapper for bridge fixtures
const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
`

// Style for the rate info
const RateInfoStyled = styled.span`
  display: flex;
  font-size: 13px;
  font-weight: 500;
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

// Bridge route with accordion
const BridgeRouteWithAccordion = ({ props, isOpen = false }: { props: typeof defaultProps; isOpen?: boolean }) => {
  const [open, setOpen] = React.useState(isOpen)

  // Create mock currency amount for the fee
  const feeAmount =
    props.bridgeFee === BridgeFeeType.FREE
      ? CurrencyAmount.fromRawAmount(USDC, 0)
      : CurrencyAmount.fromRawAmount(USDC, Math.round(parseFloat(props.bridgeFee.toString()) * 10 ** 6))

  return (
    <TradeDetailsAccordion
      rateInfo={
        <RateInfoStyled>
          1 {props.sellToken} = 3.442 {props.buyToken} <FiatValue>(≈ $0.43)</FiatValue>
        </RateInfoStyled>
      }
      feeTotalAmount={feeAmount}
      feeUsdTotalAmount={feeAmount} // Pass the feeAmount as USD amount to trigger BridgeAccordionSummary
      open={open}
      onToggle={() => setOpen(!open)}
      bridgeEstimatedTime={props.estimatedTime / 60} // Convert seconds to minutes
      bridgeProtocol={props.bridgeProvider}
      showBridgeUI={true}
    >
      <BridgeRouteBreakdown {...props} />
    </TradeDetailsAccordion>
  )
}

// Main fixture exports
const SwapForm = () => (
  <BridgeFixtureWrapper>
    <BridgeRouteWithAccordion props={defaultProps} isOpen={false} />
  </BridgeFixtureWrapper>
)

const SwapFormExpanded = () => (
  <BridgeFixtureWrapper>
    <BridgeRouteWithAccordion props={defaultProps} isOpen={true} />
  </BridgeFixtureWrapper>
)

// Export all fixtures
export default {
  SwapForm,
  SwapFormExpanded,
}
