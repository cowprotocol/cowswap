export const walletSelectors = {
  connectWalletButton: '#connect-wallet',
  connectedWalletStatus: '#web3-status-connected',
} as const

export const ethFlowSelectors = {
  banner: '#classic-eth-flow-banner',
  wrapNativeButton: '#wrap-native',
} as const

export const swapSelectors = {
  approveTradeButton: '#approve-trade-button',
  buyAmountInput: '#output-currency-input .token-amount-input',
  sellAmountInput: '#input-currency-input .token-amount-input',
  swapActionButton: '#do-trade-button',
  tradeConfirmationButton: '#trade-confirmation > button',
  unlockCrossChainSwapButton: '#unlock-cross-chain-swap-btn',
} as const

export const accountSelectors = {
  accountIdentifierRow: '#web3-account-identifier-row',
} as const
