import { validatedRecipient } from 'state/swap/hooks'
import { Field, ReplaceSwapStatePayload } from 'state/swap/actions'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { TradeStateFromUrl } from 'pages/NewSwap/typings'
import { SupportedChainId } from 'constants/chains'
import { SwapState } from 'state/swap/reducer'

function calculateIndependentField(urlValue: string | null, persistedValue?: Field): Field {
  if (urlValue === 'input') return Field.INPUT
  if (urlValue === 'output') return Field.OUTPUT

  return persistedValue || Field.INPUT
}

export function initSwapStateFromUrl(
  chainId: SupportedChainId,
  tradeStateFromUrl: TradeStateFromUrl,
  persistedSwapState: SwapState | null
): ReplaceSwapStatePayload {
  const defaultInputToken = WETH[chainId]?.address

  const typedValue =
    (tradeStateFromUrl.amount && !isNaN(parseFloat(tradeStateFromUrl.amount)) ? tradeStateFromUrl.amount : '') ||
    persistedSwapState?.typedValue ||
    ''

  const independentField = calculateIndependentField(
    tradeStateFromUrl.independentField,
    persistedSwapState?.independentField
  )

  const recipient = validatedRecipient(tradeStateFromUrl.recipient) || persistedSwapState?.recipient || null

  // TODO: should we validate inputCurrency/outputCurrency? Now, if you set invalid value, you will see empty currency in UI
  const inputCurrencyId =
    tradeStateFromUrl.inputCurrency || persistedSwapState?.INPUT?.currencyId || defaultInputToken || undefined

  const outputCurrencyId = tradeStateFromUrl.outputCurrency || persistedSwapState?.OUTPUT?.currencyId || undefined

  return {
    chainId,
    inputCurrencyId,
    outputCurrencyId,
    typedValue,
    independentField,
    recipient,
  }
}
