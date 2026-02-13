import { useIsCoinbaseWallet, useWalletInfo, useWalletSupportedChainIds } from '@cowprotocol/wallet'

import { useIsCurrentTradeBridging } from 'modules/trade/hooks/useIsCurrentTradeBridging'

import { useSwapDerivedState } from './useSwapDerivedState'

/**
 * Returns true when the trade should be hard-blocked because the Coinbase Smart Wallet
 * doesn't exist on the destination chain and no external recipient is set.
 *
 * Used by both Warnings (banner visibility) and TradeButtons (isDisabled). Keep in sync.
 */
export function useShouldBlockUnsupportedDestination(): boolean {
  const isCoinbaseWallet = useIsCoinbaseWallet()
  const walletSupportedChainIds = useWalletSupportedChainIds()
  const isBridging = useIsCurrentTradeBridging()
  const { account } = useWalletInfo()
  const { recipient, recipientAddress, outputCurrency } = useSwapDerivedState()

  const outputChainId = outputCurrency?.chainId

  // Scope to Coinbase wallets only — Safe/other SCWs have separate restriction flows.
  // walletSupportedChainIds being defined already implies SCW (only set when atomic caps detected).
  // Coinbase EOAs won't trigger this because their walletSupportedChainIds is undefined.
  const isUnsupportedDestination =
    isCoinbaseWallet &&
    walletSupportedChainIds !== undefined &&
    isBridging &&
    outputChainId !== undefined &&
    !walletSupportedChainIds.has(outputChainId)

  if (!isUnsupportedDestination) return false

  // Recipient check is based on resolved state, NOT on showRecipient UI toggle.
  // Recipients can arrive via URL (?recipient=0x...) with showRecipient=false.
  const effectiveRecipient = recipientAddress || recipient
  const hasExternalRecipient =
    !!effectiveRecipient && !!account && effectiveRecipient.toLowerCase() !== account.toLowerCase()

  return !hasExternalRecipient
}
