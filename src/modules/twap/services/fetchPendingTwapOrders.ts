import type { ParamType, Result } from '@ethersproject/abi'
import { defaultAbiCoder } from '@ethersproject/abi'
import type { BigNumber } from '@ethersproject/bignumber'
import type SafeApiKit from '@safe-global/api-kit'
import type SafeAppsSDK from '@safe-global/safe-apps-sdk'
import type { DataDecoded } from '@safe-global/safe-gateway-typescript-sdk'

import { isTruthy } from 'legacy/utils/misc'

import { ComposableCoW } from 'abis/types'

import { TWAPOrderItem, TWAPOrderStruct } from '../types'

const twapStructAbi = [
  { name: 'sellToken', type: 'address' },
  { name: 'buyToken', type: 'address' },
  { name: 'receiver', type: 'address' },
  { name: 'partSellAmount', type: 'uint256' },
  { name: 'minPartLimit', type: 'uint256' },
  { name: 't0', type: 'uint256' },
  { name: 'n', type: 'uint256' },
  { name: 't', type: 'uint256' },
  { name: 'span', type: 'uint256' },
] as ParamType[]

const CONDITIONAL_ORDER_PARAMS_STRUCT = 'tuple(address handler, bytes32 salt, bytes staticInput)'

type CreateFnResult = {
  params: {
    staticInput: string
    salt: string
    handler: string
  }
}

export async function fetchPendingTwapOrders(
  safeAppsSdk: SafeAppsSDK,
  safeApiKit: SafeApiKit,
  composableCowContract: ComposableCoW
): Promise<TWAPOrderItem[]> {
  const safeAddress = (await safeAppsSdk.safe.getInfo()).safeAddress
  const pendingTxs = await safeApiKit.getPendingTransactions(safeAddress)
  const results = pendingTxs?.results || []

  return results
    .map((result) => {
      const dataDecoded = result.dataDecoded as DataDecoded | undefined
      const valueDecoded = dataDecoded?.parameters?.[0].valueDecoded || []
      const callDatas = valueDecoded.map((value) => value.data)

      return callDatas
        .map((callData) => {
          return callData ? parseTwapOrderItem(composableCowContract, callData, result.submissionDate) : null
        })
        .filter(isTruthy)
    })
    .flat()
}

function parseTwapOrderItem(
  composableCowContract: ComposableCoW,
  callData: string,
  submissionDate: string
): TWAPOrderItem | null {
  try {
    const _result = composableCowContract.interface.decodeFunctionData('create', callData)
    const { params } = _result as any as CreateFnResult

    const twapOrderRawStruct = defaultAbiCoder.decode(twapStructAbi, params.staticInput)
    const order = parseTwapOrderStruct(twapOrderRawStruct)

    const hash = defaultAbiCoder.encode(
      [CONDITIONAL_ORDER_PARAMS_STRUCT],
      [{ handler: params.handler, salt: params.salt, staticInput: params.staticInput }]
    )

    return { order, hash, submissionDate }
  } catch (e) {
    return null
  }
}

function parseTwapOrderStruct(rawData: Result): TWAPOrderStruct {
  return {
    sellToken: rawData['sellToken'],
    buyToken: rawData['buyToken'],
    receiver: rawData['receiver'],
    partSellAmount: (rawData['partSellAmount'] as BigNumber).toHexString(),
    minPartLimit: (rawData['minPartLimit'] as BigNumber).toHexString(),
    t0: (rawData['t0'] as BigNumber).toNumber(),
    n: (rawData['n'] as BigNumber).toNumber(),
    t: (rawData['t'] as BigNumber).toNumber(),
    span: (rawData['span'] as BigNumber).toNumber(),
  }
}
