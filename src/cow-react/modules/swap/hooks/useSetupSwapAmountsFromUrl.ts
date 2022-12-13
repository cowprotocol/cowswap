import { useHistory, useLocation } from 'react-router-dom'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import { useSwapActionHandlers } from 'state/swap/hooks'
import { Field } from 'state/swap/actions'

function validateAmount(amount: string | null): string | null {
  if (!amount) return null

  // Allow only int or float
  if (/^\d+\.?\d*$/.test(amount)) return amount

  return null
}

const SELL_AMOUNT_KEY = 'sellAmount'
const BUY_AMOUNT_KEY = 'buyAmount'

/**
 * Parse sell/buy amount from URL and apply to Swap widget
 * Examples:
 * /#/1/swap/WETH/COW?sellAmount=750.20
 * /#/1/swap/WETH/COW?buyAmount=750.20
 *
 * In case when both sellAmount and buyAmount specified, buyAmount will be ignored
 */
export function useSetupSwapAmountsFromUrl() {
  const { search, pathname } = useLocation()
  const history = useHistory()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const { onUserInput } = useSwapActionHandlers()

  const cleanParams = useCallback(() => {
    const queryParams = new URLSearchParams(search)

    queryParams.delete(SELL_AMOUNT_KEY)
    queryParams.delete(BUY_AMOUNT_KEY)

    history.push(pathname + '?' + queryParams)
  }, [history, pathname, search])

  useLayoutEffect(() => {
    const sellAmount = validateAmount(params.get(SELL_AMOUNT_KEY))
    const buyAmount = validateAmount(params.get(BUY_AMOUNT_KEY))

    if (sellAmount) {
      onUserInput(Field.INPUT, sellAmount)
    } else if (buyAmount) {
      onUserInput(Field.OUTPUT, buyAmount)
    }

    cleanParams()
  }, [params, onUserInput, cleanParams])
}
