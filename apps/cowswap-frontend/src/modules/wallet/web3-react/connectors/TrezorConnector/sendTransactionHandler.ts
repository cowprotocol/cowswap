import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from '@ethersproject/providers'
import { serialize } from '@ethersproject/transactions'

import { EthereumTransaction } from '@trezor/connect'
import { jotaiStore } from 'jotaiStore'

import { gasPriceAtom } from 'modules/gasPirce'

import { getHwAccount } from '../../../api/utils/getHwAccount'

import type { TrezorConnect } from '@trezor/connect-web'

// TODO: use API or Oracle for gas price
const DEFAULT_GOERLI_GAS_PRICE = 40 * 10 ** 9 // 40 GWEI

export async function sendTransactionHandler(
  params: [{ to: string; value: string | undefined; data: string | undefined }],
  account: string,
  provider: JsonRpcProvider,
  trezorConnect: TrezorConnect
) {
  const { chainId } = await provider.getNetwork()
  const nonce = await provider.send('eth_getTransactionCount', [account, 'latest'])

  const originalTx = params[0]
  const estimation = await provider.estimateGas(originalTx)
  const gasPrice = chainId === SupportedChainId.GOERLI ? DEFAULT_GOERLI_GAS_PRICE : jotaiStore.get(gasPriceAtom)?.fast

  const transaction: EthereumTransaction = {
    to: originalTx.to,
    value: originalTx.value || '0x0',
    data: originalTx.data || '0x',
    gasPrice: gasPrice ? `0x${BigInt(gasPrice).toString(16)}` : '0x0',
    gasLimit: estimation.toHexString(),
    nonce,
    chainId,
  }

  const { success, payload } = await trezorConnect.ethereumSignTransaction({
    path: getHwAccount().path,
    transaction,
  })

  if (!success) {
    console.error('Trezor tx signing error: ', payload)
    throw new Error(payload.error)
  }

  const serialized = serialize(
    { ...transaction, nonce: +transaction.nonce },
    {
      ...payload,
      v: +payload.v,
    }
  )

  return provider.send('eth_sendRawTransaction', [serialized])
}
