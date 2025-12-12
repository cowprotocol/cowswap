import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useDerivedTradeState } from '../../trade'
import { useIsCurrentTradeBridging } from '../../trade/hooks/useIsCurrentTradeBridging'
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

  return !!isSmartContractWallet && !!outputCurrencyAmount && isCurrentTradeBridging && !isLoading
}
