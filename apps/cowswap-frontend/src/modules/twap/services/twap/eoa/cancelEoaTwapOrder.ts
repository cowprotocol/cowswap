import type { Hex, WalletClient } from 'viem'

import { isRejectRequestProviderError, logTwap, normalizeError } from '@cowprotocol/common-utils'

import { ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG, getCowShedHooks } from 'modules/accountProxy'

import { encodeTrustedExecuteHooksCalldata } from './buildEoaTwapTrustedExecuteTx'

import { cancelTwapOrderTxs, CancelTwapOrderContext } from '../../cancelTwapOrderTxs'

export const EOA_TWAP_CANCELLATION_GAS_LIMIT = 600_000n

export interface CancelEoaTwapOrderParams
  extends Pick<
    CancelTwapOrderContext,
    | 'chainId'
    | 'composableCowAddress'
    | 'composableCowAbi'
    | 'settlementAddress'
    | 'settlementAbi'
    | 'orderId'
    | 'partOrderId'
  > {
  walletClient: WalletClient
  partOnly?: boolean
}

export async function cancelEoaTwapOrder(context: CancelEoaTwapOrderParams): Promise<Hex> {
  const { chainId, walletClient } = context

  if (!walletClient.account || !walletClient.chain) {
    throw new Error('Wallet client chain and account are required to cancel an EOA TWAP order')
  }

  const logContext = {
    orderId: context.orderId,
    partOrderId: context.partOrderId,
    partOnly: context.partOnly,
  }

  logTwap.info('Cancelling EOA TWAP order', logContext)

  try {
    const cowShedHooks = getCowShedHooks({ chainId, accountProxyConfig: ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG })
    const calls = cancelTwapOrderTxs(context).map(({ to, data }) => ({
      target: to,
      callData: data,
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    }))
    const txHash = await walletClient.sendTransaction({
      to: cowShedHooks.proxyOf(walletClient.account.address) as Hex,
      data: encodeTrustedExecuteHooksCalldata(calls),
      account: walletClient.account,
      chain: walletClient.chain,
      gas: EOA_TWAP_CANCELLATION_GAS_LIMIT,
    })

    logTwap.info('Submitted EOA TWAP cancellation', { ...logContext, txHash })

    return txHash
  } catch (err: unknown) {
    const error = normalizeError(err)

    if (isRejectRequestProviderError(err)) {
      logTwap.info('EOA TWAP cancellation rejected by user', logContext)
    } else {
      logTwap.error(error, { orderId: context.orderId })
    }

    throw error
  }
}
