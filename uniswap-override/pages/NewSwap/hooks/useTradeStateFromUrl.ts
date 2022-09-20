import { useLocation } from 'react-router-dom'
import { TradeStateFromUrl } from 'pages/NewSwap/typings'
import { useMemo } from 'react'

export function useTradeStateFromUrl(): TradeStateFromUrl {
  const { search } = useLocation()

  return useMemo(() => {
    const searchParams = new URLSearchParams(search)
    const inputCurrency = searchParams.get('inputCurrency')
    const outputCurrency = searchParams.get('outputCurrency')
    const recipient = searchParams.get('recipient')
    const independentField = searchParams.get('exactField') || searchParams.get('independentField')
    const amount = searchParams.get('exactAmount') || searchParams.get('amount')

    return { inputCurrency, outputCurrency, recipient, amount, independentField }
  }, [search])
}
