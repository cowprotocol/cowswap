import { useMemo } from 'react'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import { _estimateTxCost, _isLowBalanceCheck, _getAvailableTransactions } from 'components/swap/EthWethWrap/helpers'
import { useGasPrices } from 'state/gas/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { Props } from 'components/swap/EthWethWrap'

type RemainingTxAndCostsParams = Pick<Props, 'nativeInput' | 'native'> & {
  nativeBalance: CurrencyAmount<Currency> | undefined
}

export default function useRemainingNativeTxsAndCosts({
  native,
  nativeBalance,
  nativeInput,
}: RemainingTxAndCostsParams) {
  const { chainId } = useActiveWeb3React()
  const gasPrice = useGasPrices(chainId)
  // returns the cost of 1 tx and multi txs
  const txCosts = useMemo(() => _estimateTxCost(gasPrice, native), [gasPrice, native])
  // does the user have a lower than set threshold balance? show error
  const balanceChecks: { isLowBalance: boolean; txsRemaining: string | null } | undefined = useMemo(() => {
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
