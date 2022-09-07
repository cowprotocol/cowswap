import { validatedRecipient } from 'state/swap/hooks'
import { Field, ReplaceSwapStatePayload } from 'state/swap/actions'
import { USDC, WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { TradeStateFromUrl } from 'pages/NewSwap/typings'
import { SupportedChainId } from 'constants/chains'
import { SwapState } from 'state/swap/reducer'

export function initSwapStateFromUrl(
  chainId: SupportedChainId,
  tradeStateFromUrl: TradeStateFromUrl,
  persistedSwapState: SwapState | null
): ReplaceSwapStatePayload {
  const defaultInputToken = WETH[chainId]?.address
  const defaultOutputToken = USDC[chainId]?.address

  const typedValue =
    (tradeStateFromUrl.amount && !isNaN(parseFloat(tradeStateFromUrl.amount)) ? tradeStateFromUrl.amount : '') ||
    persistedSwapState?.typedValue ||
    '1'

  const independentField =
    tradeStateFromUrl.independentField === 'output' ? Field.OUTPUT : persistedSwapState?.independentField || Field.INPUT

  const recipient = validatedRecipient(tradeStateFromUrl.recipient) || persistedSwapState?.recipient || null

  // TODO: should we validate inputCurrency/outputCurrency? Now, if you set invalid value, you will see empty currency in UI
  const inputCurrencyId =
    tradeStateFromUrl.inputCurrency || persistedSwapState?.INPUT?.currencyId || defaultInputToken || undefined

  const outputCurrencyId =
    tradeStateFromUrl.outputCurrency || persistedSwapState?.OUTPUT?.currencyId || defaultOutputToken || undefined

  return {
    chainId,
    inputCurrencyId,
    outputCurrencyId,
    typedValue,
    independentField,
    recipient,
  }
}
