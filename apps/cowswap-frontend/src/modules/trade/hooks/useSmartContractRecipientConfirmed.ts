import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'
import { useRecipientRequirement } from './useRecipientRequirement'

import { useTradeQuote } from '../../tradeQuote'

const smartContractRecipientConfirmedAtom = atom(false)

export function useSmartContractRecipientConfirmed(): boolean {
  return useAtomValue(smartContractRecipientConfirmedAtom)
}

export function useToggleSmartContractRecipientConfirmed(): (state: boolean) => void {
  const setState = useSetAtom(smartContractRecipientConfirmedAtom)

  return useCallback(
    (state: boolean) => {
      setState(state)
    },
    [setState],
  )
}

export function useShouldCheckBridgingRecipient(): boolean {
  const { outputCurrencyAmount } = useDerivedTradeState() || {}
  const { isLoading } = useTradeQuote()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const isSmartContractWallet = useIsSmartContractWallet()
  const recipientRequirement = useRecipientRequirement()

  return (
    !!isSmartContractWallet &&
    !!outputCurrencyAmount &&
    isCurrentTradeBridging &&
    !isLoading &&
    !recipientRequirement.isRecipientRequired
  )
}

export function useShouldCheckNonEvmRecipient(): boolean {
  const { isLoading } = useTradeQuote()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const recipientRequirement = useRecipientRequirement()

  return (
    isCurrentTradeBridging &&
    !isLoading &&
    recipientRequirement.isRecipientRequired &&
    !recipientRequirement.isRecipientMissing &&
    recipientRequirement.isRecipientValid
  )
}

export function useShouldConfirmRecipient(): boolean {
  const shouldCheckBridgingRecipient = useShouldCheckBridgingRecipient()
  const shouldCheckNonEvmRecipient = useShouldCheckNonEvmRecipient()

  return shouldCheckBridgingRecipient || shouldCheckNonEvmRecipient
}
