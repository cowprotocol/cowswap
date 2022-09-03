import { validatedRecipient } from '@src/state/swap/hooks'
import { Field, ReplaceSwapStatePayload } from '@src/state/swap/actions'
import { USDC, WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { TradeStateFromUrl } from 'pages/NewSwap/typings'
import { SupportedChainId } from 'constants/chains'
import { SwapState } from 'state/swap/reducer'

export function initSwapStateFromUrl(
  chainId: SupportedChainId,
  tradeStateFromUrl: TradeStateFromUrl,
  persistedSwapState: SwapState
): ReplaceSwapStatePayload {
  const defaultInputToken = WETH[chainId]?.address
  const defaultOutputToken = USDC[chainId]?.address

  const typedValue =
    (tradeStateFromUrl.amount && !isNaN(parseFloat(tradeStateFromUrl.amount)) ? tradeStateFromUrl.amount : '') ||
    persistedSwapState.typedValue ||
    ''

  const independentField =
    tradeStateFromUrl.independentField === 'output' ? Field.OUTPUT : persistedSwapState.independentField || Field.INPUT

  const recipient = validatedRecipient(tradeStateFromUrl.recipient) || persistedSwapState.recipient

  const inputCurrencyId =
    tradeStateFromUrl.inputCurrency || persistedSwapState.INPUT.currencyId || defaultInputToken || undefined

  const outputCurrencyId =
    tradeStateFromUrl.outputCurrency || persistedSwapState.OUTPUT.currencyId || defaultOutputToken || undefined

  return {
    inputCurrencyId,
    outputCurrencyId,
    typedValue,
    independentField,
    recipient,
  }
}
