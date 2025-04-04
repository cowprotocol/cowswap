import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useValue } from 'react-cosmos/client'

import { BridgeRouteBreakdown, BridgeRouteBreakdownProps } from './BridgeRouteBreakdown'

import { BridgeFeeType, BridgeProtocolConfig } from '../types'

// Define sample data FIRST

// Re-define provider configs using the correct type
const connextProviderConfig: BridgeProtocolConfig = {
  icon: '/path/to/connext/icon.svg', // Replace with actual icon path if available
  title: 'Connext',
  url: 'https://connext.network/',
  description: 'Connext bridge provider',
}

const hopProviderConfig: BridgeProtocolConfig = {
  icon: '/path/to/hop/icon.svg', // Replace with actual icon path if available
  title: 'Hop Protocol',
  url: 'https://hop.exchange/',
  description: 'Hop Protocol bridge provider',
}

// Define the main sample props using the structure from the old DEMO_BRIDGE_DATA
const sampleProps: BridgeRouteBreakdownProps = {
  // Swap details
  sellAmount: '1000',
  sellToken: 'USDC',
  sellTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  buyAmount: '995', // Adjusted from COW demo data to keep USDC example
  buyToken: 'USDC',
  buyTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  networkCost: '0.5', // Adjusted from demo
  networkCostUsd: '0.45',
  swapMinReceive: '990', // Adjusted from demo
  swapExpectedToReceive: '994', // Adjusted from demo
  swapMaxSlippage: '0.5',

  // Bridge details
  bridgeAmount: '994', // Adjusted from demo (amount after swap)
  bridgeToken: 'USDC',
  bridgeTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  bridgeTokenReceiveAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon USDC
  bridgeReceiveAmount: '993', // Adjusted from demo
  bridgeFee: '1.50', // Adjusted from demo
  maxBridgeSlippage: '1', // Adjusted from demo
  estimatedTime: 1200, // 20 minutes in seconds (adjusted from demo)
  recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth (from demo)
  recipientChainId: SupportedChainId.GNOSIS_CHAIN, // Keep Gnosis for now due to POLYGON issue
  sourceChainId: SupportedChainId.MAINNET,

  // Bridge provider info
  bridgeProvider: connextProviderConfig, // Use defined Connext config
}

// Define props for the free fee scenario
const freeFeeProps: BridgeRouteBreakdownProps = {
  ...sampleProps,
  bridgeFee: BridgeFeeType.FREE,
  bridgeProvider: hopProviderConfig, // Use defined Hop config
}

// Now define exports
export default {
  title: 'Modules/Bridge/BridgeRouteBreakdown',
  component: BridgeRouteBreakdown,
}

export const Default = (): JSX.Element => <BridgeRouteBreakdown {...sampleProps} />

export const FreeBridgeFee = (): JSX.Element => <BridgeRouteBreakdown {...freeFeeProps} />

export const Interactive = (): JSX.Element => {
  // Controls for optional props
  const [showSwapMinReceive, _setShowSwapMinReceive] = useValue<boolean>('Show Swap Min Receive', {
    defaultValue: true,
  })
  const [showSwapExpected, _setShowSwapExpected] = useValue<boolean>('Show Swap Expected Receive', {
    defaultValue: true,
  })
  const [showSwapMaxSlippage, _setShowSwapMaxSlippage] = useValue<boolean>('Show Swap Max Slippage', {
    defaultValue: true,
  })
  const [showNetworkCostUsd, _setShowNetworkCostUsd] = useValue<boolean>('Show Network Cost USD', {
    defaultValue: true,
  })
  const [bridgeFee, _setBridgeFee] = useValue<string>('Bridge Fee (number or FREE)', {
    defaultValue: sampleProps.bridgeFee as string,
  })
  const [isRecipientAddress, _setIsRecipientAddress] = useValue<boolean>('Recipient is Address', { defaultValue: true })

  const interactiveProps: BridgeRouteBreakdownProps = {
    ...sampleProps, // Start with base props
    swapMinReceive: showSwapMinReceive ? sampleProps.swapMinReceive : undefined,
    swapExpectedToReceive: showSwapExpected ? sampleProps.swapExpectedToReceive : undefined,
    swapMaxSlippage: showSwapMaxSlippage ? sampleProps.swapMaxSlippage : undefined,
    networkCostUsd: showNetworkCostUsd ? sampleProps.networkCostUsd : '', // Pass empty string if hidden
    bridgeFee: bridgeFee === 'FREE' ? BridgeFeeType.FREE : bridgeFee,
    recipient: isRecipientAddress ? sampleProps.recipient : 'ENS.name', // Toggle between address and non-address
  }

  return <BridgeRouteBreakdown {...interactiveProps} />
}

// TODO: Add more fixtures for different scenarios (e.g., missing optional props, different chains)
// TODO: Consider controls for chain IDs or bridge providers if needed
