import { useEffect, useRef } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useAddFee, useAllFees } from './hooks'
import { useSwapState, tryParseAmount } from 'state/swap/hooks'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { FeesMap } from './reducer'
import { getFeeQuote, FeeQuoteParams } from 'utils/operator'
import { registerOnWindow } from 'utils/misc'
import { Field } from 'state/swap/actions'
import { useCurrency } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'

function isDateLater(dateA: string, dateB: string): boolean {
  const [parsedDateA, parsedDateB] = [Date.parse(dateA), Date.parse(dateB)]

  return parsedDateA > parsedDateB
}

const DEBOUNCE_TIME = 350

export default function FeesUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const {
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
    independentField,
    typedValue: rawTypedValue
  } = useSwapState()
  // debounce the typed value as to not overkill the useEffect
  // fee API calculation/call
  const typedValue = useDebounce(rawTypedValue, DEBOUNCE_TIME)

  // to not rerun useEffect and check if amount really changed
  const typedValueRef = useRef(typedValue)

  const sellCurrency = useCurrency(sellToken)
  const buyCurrency = useCurrency(buyToken)

  const stateFeesMap = useAllFees({ chainId })
  const addFee = useAddFee()

  const windowVisible = useIsWindowVisible()

  const now = new Date().toISOString()

  useEffect(() => {
    if (!stateFeesMap || !chainId || !sellToken || !buyToken || !typedValue || !windowVisible) return

    registerOnWindow({ addFee })

    const kind = independentField === Field.INPUT ? 'sell' : 'buy'
    const amount = tryParseAmount(typedValue, (kind === 'sell' ? sellCurrency : buyCurrency) ?? undefined)

    // type check...
    if (!amount) return

    async function runFeeHook({
      feesMap,
      chainId,
      sellToken,
      buyToken,
      amount,
      kind
    }: FeeQuoteParams & { feesMap: Partial<FeesMap> }) {
      const currentFee = feesMap[sellToken]?.fee
      const isFeeDateValid = currentFee && isDateLater(currentFee.expirationDate, now)

      if (typedValueRef.current !== typedValue || !isFeeDateValid || !currentFee) {
        const fee = await getFeeQuote({ chainId, sellToken, buyToken, amount, kind }).catch(err => {
          console.error(new Error(err))
          return null
        })

        typedValueRef.current = typedValue

        fee &&
          addFee({
            token: sellToken,
            fee,
            chainId
          })
      }
    }

    runFeeHook({ feesMap: stateFeesMap, sellToken, buyToken, chainId, kind, amount: amount.raw.toString() })
  }, [
    windowVisible,
    chainId,
    now,
    addFee,
    stateFeesMap,
    sellToken,
    buyToken,
    independentField,
    typedValue,
    sellCurrency,
    buyCurrency
  ])

  return null
}
