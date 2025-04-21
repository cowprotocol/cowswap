import bungeeIcon from '@cowprotocol/assets/images/bungee-logo.svg'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { GlobalCoWDAOStyles } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { ThemeProvider } from 'theme'

import { BodyWrapper } from 'modules/application/containers/App/styled'
import { Container, ContainerBox } from 'modules/trade/containers/TradeWidget/styled'

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

// Main fixture exports
const Default = () => (
  <BridgeFixtureWrapper>
    <BridgeRouteBreakdown {...defaultProps} />
  </BridgeFixtureWrapper>
)

const FreeBridgeFee = () => (
  <BridgeFixtureWrapper>
    <BridgeRouteBreakdown {...defaultProps} bridgeFee={BridgeFeeType.FREE} bridgeProvider={bungeeProviderConfig} />
  </BridgeFixtureWrapper>
)

// Export all fixtures
export default {
  Default,
  FreeBridgeFee,
}
