import { stringToHex, type Hex, type WalletClient } from 'viem'

import { isRejectRequestProviderError, logTwap, normalizeError } from '@cowprotocol/common-utils'
import type { Signer } from '@cowprotocol/cow-sdk'
import { ContractsSigningScheme } from '@cowprotocol/sdk-contracts-ts'

import { EOA_TWAP_ACCOUNT_PROXY_CONFIG, getCowShedHooks } from 'modules/accountProxy'

import { cancelTwapOrderTxs, CancelTwapOrderContext } from '../../cancelTwapOrderTxs'

const CANCELLATION_SIGNATURE_VALID_FOR_SEC = 1800n

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
  signer: Signer
  walletClient: WalletClient
}

export async function cancelEoaTwapOrder(context: CancelEoaTwapOrderParams): Promise<Hex> {
  const { chainId, signer, walletClient } = context

  if (!walletClient.account || !walletClient.chain) {
    throw new Error('Wallet client chain and account are required to cancel an EOA TWAP order')
  }

  const logContext = {
    orderId: context.orderId,
    partOrderId: context.partOrderId,
  }

  logTwap.info('Cancelling EOA TWAP order', logContext)

  try {
    const cowShedHooks = getCowShedHooks({ chainId, accountProxyConfig: EOA_TWAP_ACCOUNT_PROXY_CONFIG })
    const calls = cancelTwapOrderTxs(context).map(({ to, data }) => ({
      target: to,
      callData: data,
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    }))
    const nonceHex = stringToHex(Date.now().toString()).slice(2)
    const nonce = `0x${(nonceHex + '0'.repeat(64)).slice(0, 64)}`
    const deadline = BigInt(Math.ceil(Date.now() / 1000)) + CANCELLATION_SIGNATURE_VALID_FOR_SEC
    const signature = await cowShedHooks.signCalls(calls, nonce, deadline, ContractsSigningScheme.EIP712, signer)
    const callData = cowShedHooks.encodeExecuteHooksForFactory(
      calls,
      nonce,
      deadline,
      walletClient.account.address,
      signature,
    )
    const txHash = await walletClient.sendTransaction({
      to: cowShedHooks.getFactoryAddress() as Hex,
      data: callData as Hex,
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
