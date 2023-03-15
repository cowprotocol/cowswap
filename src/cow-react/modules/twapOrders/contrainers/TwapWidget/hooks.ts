/* eslint-disable */
import { BigNumber, BigNumberish, EventFilter } from 'ethers'
import { Log } from '@ethersproject/providers'
import { useGetSafeTransactions } from '@src/custom/hooks/useGetSafeInfo'
import { useWeb3React, Web3ReactProviderProps } from '@web3-react/core'
import { useTokenLazy } from 'hooks/useTokenLazy'
import { id } from '@ethersproject/hash'
import {
  EthereumTxWithTransfersResponse,
  SafeMultisigTransactionWithTransfersResponse,
} from '@gnosis.pm/safe-service-client'
import { defaultAbiCoder } from 'ethers/lib/utils'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useToken } from '@src/hooks/Tokens'
import type { Web3Provider } from '@ethersproject/providers'

const TWAP_DATA_ABI_PARAMS = [
  'address',
  'address',
  'address',
  'address',
  'address',
  'uint256',
  'uint256',
  'uint256',
  'uint256',
  'uint256',
  'uint256',
]

const TOPIC_TWAP = id('ConditionalOrderCreated(address,bytes)') // '0x4af0ada67198226ad089fb87300dc01d76fb8883a59e6642c05a2f01dfd1eb67'

export interface TwapOrder {
  sellToken: Token
  buyToken: Token
  partSellAmount: CurrencyAmount<Token> // partSellAmount
  totalSellAmount: CurrencyAmount<Token> // partSellAmount * n
  numberParts: number // n
  frequencySeconds: number // Number of seconds between executions (t)
  startDate: Date // t0
  endDate: Date
  partValiditySeconds: number // span
  receiver: string
}

// interface TwapData {
//   sellToken: string
//   buyToken: string
//   partSellAmount: BigNumberish
//   n: number
//   minPartLimit: BigNumberish
//   t: number
//   t0: number
//   span: number
//   receiver: string
// }

export function useGetTwapLogs() {
  const { provider } = useWeb3React()
  return async (safeAddress: string) => {
    if (!provider) return

    const filter: EventFilter = {
      // address: safeAddress,
      topics: [TOPIC_TWAP],
    }

    return provider.getLogs(filter)
  }
}

async function fromLogToTwapOrder(
  orderLog: Log,
  getToken: (address: string) => Promise<Token | null>
): Promise<TwapOrder> {
  const [, , sellTokenAddress, buyTokenAddress, receiver, partSellAmountRaw, minPartLimit, t0, n, t, span] =
    defaultAbiCoder.decode(TWAP_DATA_ABI_PARAMS, orderLog.data)

  const [sellToken, buyToken] = await Promise.all([getToken(sellTokenAddress), getToken(buyTokenAddress)])

  if (!sellToken || !buyToken) {
    throw new Error('getToken failed for either ' + [sellToken, buyToken].join('or'))
  }

  const partSellAmount = CurrencyAmount.fromRawAmount(sellToken, partSellAmountRaw.toString())
  const numberParts = (n as BigNumber).toNumber()
  const totalSellAmount = partSellAmount.multiply(numberParts)
  const frequencySeconds = (t as BigNumber).toNumber()
  const startDate = new Date((t0 as BigNumber).toNumber() * 1000)
  const endDate = new Date(startDate.getTime() + numberParts * frequencySeconds * 1000)
  const partValiditySecondsRaw = (span as BigNumber).toNumber()
  const partValiditySeconds = partValiditySecondsRaw === 0 ? frequencySeconds : partValiditySecondsRaw

  // console.log('[Twap] orderLog.data', orderLog.data)
  return {
    sellToken,
    buyToken,
    partSellAmount,
    totalSellAmount,
    numberParts,
    frequencySeconds,
    startDate,
    endDate,
    partValiditySeconds,
    receiver,
  }
}

async function getOrdersFromMultisigTransaction(
  tx: SafeMultisigTransactionWithTransfersResponse,
  getToken: (address: string) => Promise<Token | null>,
  provider: Web3Provider
): Promise<TwapOrder[]> {
  console.log('[Twap] Multisig Transaction ', tx.nonce, tx.transactionHash)

  if (!tx.transactionHash) {
    return []
  }

  const receipt = await provider.getTransactionReceipt(tx.transactionHash)

  // Filter and map logs to TwapData
  const ordersPromises = receipt.logs
    .filter((log) => log.topics[0] === TOPIC_TWAP)
    .map((log) => fromLogToTwapOrder(log, getToken))

  return Promise.all(ordersPromises)
}

// https://explorer.cow.fi/goerli/address/0xd0306d218d45f5ecc9114dc45df48d8c18ab3291
// https://explorer.cow.fi/goerli/orders/0x59389358f3e48a23391701247306a828fcca196a787c37d4b6a7f8a70452cd39d0306d218d45f5ecc9114dc45df48d8c18ab3291641054c7

export function useGetTwapTrades() {}

export function useGetTwapOrders() {
  const { provider } = useWeb3React()
  const getToken = useTokenLazy()

  const getSafeTransactions = useGetSafeTransactions()

  return async (safeAddress: string): Promise<TwapOrder[] | null> => {
    // console.log('[Twap] getOrders')
    if (!provider) return null

    // console.log('[Twap] Get Orders for safe ', safeAddress)
    const { promise: txsPromise } = getSafeTransactions('0xD0306D218D45f5eCC9114dc45Df48d8C18aB3291') // safeAddress!
    const txs = await txsPromise
    // console.log('[Twap] ', txs.results)

    let allOrders: TwapOrder[] = []
    for (const _tx of txs.results) {
      if (_tx.txType === 'ETHEREUM_TRANSACTION') {
        const tx = _tx as EthereumTxWithTransfersResponse
        // console.log('[Twap] Ethereum Transaction', tx.txHash, tx)
      } else if (_tx.txType === 'MULTISIG_TRANSACTION') {
        const orders = await getOrdersFromMultisigTransaction(_tx, getToken, provider)

        if (orders.length > 0) {
          allOrders = allOrders.concat(orders)
        }
        // console.log('[Twap] TWAP Orders', allOrders, orders)
      }
    }

    return allOrders
  }
}
