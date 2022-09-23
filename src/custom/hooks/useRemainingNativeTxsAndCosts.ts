import { useMemo } from 'react'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import { _estimateTxCost, _isLowBalanceCheck, _getAvailableTransactions } from 'components/swap/EthFlow/helpers'
import { useGasPrices } from 'state/gas/hooks'
import { useWeb3React } from '@web3-react/core'

type RemainingTxAndCostsParams = {
  nativeBalance: CurrencyAmount<Currency> | undefined
  nativeInput: CurrencyAmount<Currency> | undefined
  native: Currency | undefined
}

export default function useRemainingNativeTxsAndCosts({
  native,
  nativeBalance,
  nativeInput,
}: RemainingTxAndCostsParams) {
  const { chainId } = useWeb3React()
  const gasPrice = useGasPrices(chainId)
  // returns the cost of 1 tx and multi txs
  const txCosts = useMemo(() => _estimateTxCost(gasPrice, native), [gasPrice, native])
  // does the user have a lower than set threshold balance? show error
  const balanceChecks: { isLowBalance: boolean; txsRemaining: string | null } | undefined = useMemo(() => {
    // we only check this for native currencies, otherwise stop
    if (!nativeInput?.currency.isNative) return undefined
    const { multiTxCost, singleTxCost } = txCosts

    return {
      isLowBalance: _isLowBalanceCheck({
        threshold: multiTxCost,
        nativeInput,
        balance: nativeBalance,
        txCost: singleTxCost,
      }),
      txsRemaining: _getAvailableTransactions({ nativeBalance, nativeInput, singleTxCost }),
    }
  }, [txCosts, nativeBalance, nativeInput])

  return { balanceChecks, ...txCosts }
}
