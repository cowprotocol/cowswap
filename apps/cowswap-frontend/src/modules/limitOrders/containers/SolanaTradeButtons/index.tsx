import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useState } from 'react'

import { isFractionFalsy, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { ExternalLink } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useSolanaOrderFlowContext } from 'modules/limitOrders/hooks/useSolanaOrderFlowContext'
import { solanaOrderFlow } from 'modules/limitOrders/services/solanaOrderFlow'
import { SOLSCAN_TX_URL } from 'modules/limitOrders/services/solanaOrderFlow/const'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { TradeFormBlankButton } from 'modules/tradeFormValidation'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

/**
 * Prototype placement flow for Solana limit orders: no quote, no confirm modal.
 * The button sends the create-order transaction directly and reports the
 * result in a snackbar with a Solscan link.
 */

export function SolanaTradeButtons(): ReactNode {
  const { account } = useWalletInfo()
  const solanaContext = useSolanaOrderFlowContext()
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, inputCurrencyBalance } =
    useLimitOrdersDerivedState()
  const { activeRate } = useAtomValue(limitRateAtom)
  const addSnackbar = useAddSnackbar()
  const [isPending, setIsPending] = useState(false)

  const placeOrder = useCallback(async () => {
    if (!solanaContext) return

    setIsPending(true)
    try {
      const { signature, orderUid } = await solanaOrderFlow(solanaContext)

      addSnackbar({
        id: `solana-order-${signature}`,
        icon: 'success',
        content: (
          <span>
            <Trans>Solana limit order created</Trans> (UID {orderUid.slice(0, 8)}…){' '}
            <ExternalLink href={`${SOLSCAN_TX_URL}${signature}`}>
              <Trans>View on Solscan</Trans>
            </ExternalLink>
          </span>
        ),
      })
    } catch (error) {
      if (!isRejectRequestProviderError(error)) {
        addSnackbar({
          id: 'solana-order-error',
          icon: 'alert',
          content: <span>{getSwapErrorMessage(error)}</span>,
        })
      }
    } finally {
      setIsPending(false)
    }
  }, [solanaContext, addSnackbar])

  if (!account) {
    return (
      <TradeFormBlankButton id="solana-connect-wallet" disabled>
        <Trans>Connect wallet</Trans>
      </TradeFormBlankButton>
    )
  }

  if (!inputCurrency || !outputCurrency) {
    return (
      <TradeFormBlankButton id="solana-select-token" disabled>
        <Trans>Select a token</Trans>
      </TradeFormBlankButton>
    )
  }

  if (isFractionFalsy(inputCurrencyAmount) || isFractionFalsy(outputCurrencyAmount)) {
    return (
      <TradeFormBlankButton id="solana-enter-amount" disabled>
        <Trans>Enter an amount</Trans>
      </TradeFormBlankButton>
    )
  }

  if (!activeRate) {
    return (
      <TradeFormBlankButton id="solana-enter-price" disabled>
        <Trans>Enter a price</Trans>
      </TradeFormBlankButton>
    )
  }

  // The sell token account must exist and hold the funds for the order to be settleable
  if (!inputCurrencyBalance || (inputCurrencyAmount && inputCurrencyBalance.lessThan(inputCurrencyAmount))) {
    return (
      <TradeFormBlankButton id="solana-insufficient-balance" disabled>
        <Trans>Insufficient balance</Trans>
      </TradeFormBlankButton>
    )
  }

  return (
    <TradeFormBlankButton
      id="solana-place-limit-order"
      onClick={placeOrder}
      disabled={isPending || !solanaContext}
      loading={isPending}
    >
      <Trans>Place limit order</Trans>
    </TradeFormBlankButton>
  )
}
