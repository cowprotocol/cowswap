import React from 'react'

import bungeeIcon from '@cowprotocol/assets/images/bungee-logo.svg'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { GlobalCoWDAOStyles } from '@cowprotocol/ui'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'
import { ThemeProvider } from 'theme'

import { BodyWrapper } from 'modules/application/containers/App/styled'
import { Container, ContainerBox } from 'modules/trade/containers/TradeWidget/styled'

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

// Prepare default props that will be used in all fixtures
const defaultProps = {
  // Swap details
  sellAmount: '1000',
  sellToken: 'USDC',
  sellTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  buyAmount: '995',
  buyToken: 'USDC',
  buyTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  networkCost: '0.5',
  networkCostUsd: '0.45',
  swapMinReceive: '990',
  swapExpectedToReceive: '994',
  swapMaxSlippage: '0.5',
  // Bridge details
  bridgeAmount: '994',
  bridgeToken: 'USDC',
  bridgeTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  bridgeTokenReceiveAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', // Gnosis Chain USDC
  bridgeReceiveAmount: '993',
  bridgeFee: '1.50',
  maxBridgeSlippage: '1',
  estimatedTime: 1200, // 20 minutes in seconds
  recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
  bridgeProvider: bungeeProviderConfig,
  // Chain IDs
  sourceChainId: SupportedChainId.MAINNET,
  recipientChainId: SupportedChainId.GNOSIS_CHAIN,
}

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

// Reusable wrapper component
const BridgeFixtureWrapper = ({ children }: { children: React.ReactNode }) => (
  <Wrapper>
    <ThemeProvider />
    <GlobalStyles />{' '}
    <BodyWrapper>
      <Container>
        <ContainerBox>{children}</ContainerBox>
      </Container>{' '}
    </BodyWrapper>
  </Wrapper>
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
          1 {props.sellToken} = 0.995 {props.buyToken} <FiatValue>(≈ $0.29)</FiatValue>
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
const Default = () => (
  <BridgeFixtureWrapper>
    <BridgeRouteWithAccordion props={defaultProps} />
  </BridgeFixtureWrapper>
)

const FreeBridgeFee = () => (
  <BridgeFixtureWrapper>
    <BridgeRouteWithAccordion
      props={{
        ...defaultProps,
        bridgeFee: BridgeFeeType.FREE,
        bridgeProvider: bungeeProviderConfig,
      }}
    />
  </BridgeFixtureWrapper>
)

// Export all fixtures
export default {
  Default,
  FreeBridgeFee,
}
