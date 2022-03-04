import { useCallback } from 'react'
import { Web3Provider } from '@ethersproject/providers'

import { Token } from '@uniswap/sdk-core'
import { Contract } from '@ethersproject/contracts'

import { useActiveWeb3React } from 'hooks/web3'
import { getBytes32TokenContract, getTokenContract } from 'hooks/useContract'
import { parseStringOrBytes32 } from 'lib/hooks/useCurrency'
import { useAddUserToken } from 'state/user/hooks'
import { Erc20 } from 'abis/types'
import { retry } from 'utils/retry'

const contractsCache: Record<string, Erc20> = {}
const bytes32ContractsCache: Record<string, Contract> = {}

const RETRY_OPTIONS = { n: 3, minWait: 100, maxWait: 3_000 }

export interface TokenInfo {
  decimals: number
  symbol?: string
  name?: string
}

export interface GetTokenInfoParams {
  chainId: number
  address: string
  account: string

  library: Web3Provider
}

async function _getTokenContract(params: GetTokenInfoParams): Promise<Erc20> {
  const { address, account, chainId, library } = params

  return contractsCache[address] || getTokenContract(address, undefined, library, account, chainId)
}

async function _getTokenBytes32Contract(params: GetTokenInfoParams): Promise<Contract> {
  const { address, account, chainId, library } = params

  return bytes32ContractsCache[address] || getBytes32TokenContract(address, undefined, library, account, chainId)
}

async function _getBytes32NameAndSymbol(
  address: string,
  account: string,
  chainId: number,
  nameSettled: PromiseFulfilledResult<string> | PromiseRejectedResult,
  symbolSettled: PromiseFulfilledResult<string> | PromiseRejectedResult,
  params: GetTokenInfoParams
) {
  console.debug(
    `[useTokenLazy::callback] name or symbol failed, trying bytes32`,
    address,
    account,
    chainId,
    nameSettled,
    symbolSettled
  )

  const bytes32Contract = await _getTokenBytes32Contract(params)
  const [nameBytes32Settled, symbolBytes32Settled] = await Promise.allSettled([
    retry<string>(bytes32Contract.name, RETRY_OPTIONS).promise,
    retry<string>(bytes32Contract.symbol, RETRY_OPTIONS).promise,
  ])

  // Merge regular and bytes32 versions in case one them was good
  const name = parseStringOrBytes32(
    nameSettled.status === 'fulfilled' ? nameSettled.value : '',
    nameBytes32Settled.status === 'fulfilled' ? nameBytes32Settled.value : '',
    'Unknown Token'
  )
  const symbol = parseStringOrBytes32(
    symbolSettled.status === 'fulfilled' ? symbolSettled.value : '',
    symbolBytes32Settled.status === 'fulfilled' ? (symbolBytes32Settled.value as any) : '',
    'UNKNOWN'
  )
  return { name, symbol }
}

async function _getNameAndSymbol(
  namePromise: Promise<string>,
  symbolPromise: Promise<string>,
  address: string,
  account: string,
  chainId: number,
  params: GetTokenInfoParams
) {
  const [nameSettled, symbolSettled] = await Promise.allSettled([namePromise, symbolPromise])

  let name, symbol
  // If no name or symbol, try the bytes32 contract
  if (
    nameSettled.status === 'rejected' ||
    !nameSettled.value ||
    symbolSettled.status === 'rejected' ||
    !symbolSettled.value
  ) {
    const bytes32Values = await _getBytes32NameAndSymbol(address, account, chainId, nameSettled, symbolSettled, params)
    name = bytes32Values.name
    symbol = bytes32Values.symbol
  } else {
    name = nameSettled.value
    symbol = symbolSettled.value
  }
  return { name, symbol }
}

async function _getTokenInfo(params: GetTokenInfoParams): Promise<TokenInfo | null> {
  const { address, account, chainId } = params
  console.debug(`[useTokenLazy::callback] input is valid`, address, account, chainId)

  const contract = await _getTokenContract(params)

  // Fetch each property individually
  const { promise: decimalsPromise } = retry(contract.decimals, RETRY_OPTIONS)
  const { promise: namePromise, cancel: cancelNamePromise } = retry(contract.name, RETRY_OPTIONS)
  const { promise: symbolPromise, cancel: cancelSymbolPromise } = retry(contract.symbol, RETRY_OPTIONS)

  let decimals: number

  try {
    // If no decimals, stop here
    decimals = await decimalsPromise
  } catch (e) {
    console.debug(`[useTokenLazy::callback] no decimals, stopping`, address, account, chainId, e)

    cancelNamePromise()
    cancelSymbolPromise()
    return null
  }
  const { name, symbol } = await _getNameAndSymbol(namePromise, symbolPromise, address, account, chainId, params)

  return { decimals, symbol, name }
}

/**
 * Hook that returns a callback which fetches data for a single token from the chain
 *
 * Alternative to hooks/Token/useToken where token address does not need to be known
 * at hook phase nor uses multicall
 */
export function useTokenLazy() {
  const { library, account, chainId } = useActiveWeb3React()
  const addUserToken = useAddUserToken()

  return useCallback(
    async (address: string): Promise<Token | null> => {
      console.debug(`[useTokenLazy::callback] callback called`, address, account, chainId)

      if (!account || !chainId || !address || !library) {
        return null
      }

      const tokenInfo = await _getTokenInfo({ chainId, account, address, library })

      if (!tokenInfo) {
        return null
      }

      const { decimals, symbol, name } = tokenInfo
      const token = new Token(chainId, address, decimals, symbol, name)

      console.debug(`[useTokenLazy::callback] loaded token`, address, account, chainId, token)

      addUserToken(token)

      return token
    },
    [account, addUserToken, chainId, library]
  )
}
