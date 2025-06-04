import { useMemo } from 'react'

import { AVG_APPROVE_COST_GWEI } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { parseUnits } from 'ethers/lib/utils'

import { useGasPrices } from 'legacy/state/gas/hooks'

import { BalanceChecks } from '../../../pure/EthFlowModalContent/EthFlowModalTopContent'

export const MINIMUM_TXS = '10'
export const DEFAULT_GAS_FEE = parseUnits('50', 'gwei')

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function _estimateTxCost(gasPrice: ReturnType<typeof useGasPrices>, native: Currency | undefined) {
  if (!native) {
    return {}
  }
  // TODO: should use DEFAULT_GAS_FEE from backup source
  // when/if implemented
  const gas = gasPrice?.average || DEFAULT_GAS_FEE

  const amount = BigNumber.from(gas).mul(MINIMUM_TXS).mul(AVG_APPROVE_COST_GWEI)

  return {
    multiTxCost: CurrencyAmount.fromRawAmount(native, amount.toString()),
    singleTxCost: CurrencyAmount.fromFractionalAmount(native, amount.toString(), MINIMUM_TXS),
  }
}

export const _getAvailableTransactions = ({
  nativeBalance,
  nativeInput,
  singleTxCost,
}: {
  nativeBalance?: CurrencyAmount<Currency>
  nativeInput?: CurrencyAmount<Currency>
  singleTxCost?: CurrencyAmount<Currency>
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}) => {
  if (!nativeBalance || !nativeInput || !singleTxCost || nativeBalance.lessThan(nativeInput.add(singleTxCost))) {
    return null
  }

  // USER_BALANCE - (USER_WRAP_AMT + 1_TX_CST) / 1_TX_COST = AVAILABLE_TXS
  const txsAvailable = nativeBalance.subtract(nativeInput.add(singleTxCost)).divide(singleTxCost)
  return txsAvailable.lessThan('1') ? null : txsAvailable.quotient.toString()
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function _isLowBalanceCheck({
  threshold,
  txCost,
  nativeInput,
  balance,
}: {
  threshold?: CurrencyAmount<Currency>
  txCost?: CurrencyAmount<Currency>
  nativeInput?: CurrencyAmount<Currency>
  balance?: CurrencyAmount<Currency>
}) {
  if (!threshold || !txCost || (nativeInput && !txCost.currency.equals(nativeInput?.currency))) return false
  if (!nativeInput || !balance || nativeInput.add(txCost).greaterThan(balance)) return true
  // OK if: users_balance - (amt_input + 1_tx_cost) > low_balance_threshold
  return balance.subtract(nativeInput.add(txCost)).lessThan(threshold)
}

export type RemainingTxAndCostsParams = {
  nativeBalance: CurrencyAmount<Currency> | undefined
  nativeInput: CurrencyAmount<Currency> | undefined
  native: Currency | undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function useRemainingNativeTxsAndCosts({
  native,
  nativeBalance,
  nativeInput,
}: RemainingTxAndCostsParams) {
  const { chainId } = useWalletInfo()
  const gasPrice = useGasPrices(chainId)
  // returns the cost of 1 tx and multi txs
  const txCosts = useMemo(() => _estimateTxCost(gasPrice, native), [gasPrice, native])
  // does the user have a lower than set threshold balance? show error
  const balanceChecks: BalanceChecks = useMemo(() => {
    // we only check this for native currencies, otherwise stop
    if ((nativeInput?.currency && !getIsNativeToken(nativeInput.currency)) || chainId !== nativeInput?.currency.chainId)
      return undefined
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
  }, [nativeInput, chainId, txCosts, nativeBalance])

  return useMemo(() => ({ balanceChecks, ...txCosts }), [balanceChecks, txCosts])
}
