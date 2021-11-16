import { useCallback } from 'react'
import { Web3Provider } from '@ethersproject/providers'

import { Token } from '@uniswap/sdk-core'
import { Contract } from '@ethersproject/contracts'

import { useActiveWeb3React } from 'hooks/web3'
import { getBytes32TokenContract, getTokenContract } from 'hooks/useContract'
import { parseStringOrBytes32 } from 'hooks/Tokens'
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

  const tokenContract = contractsCache[address] || getTokenContract(address, undefined, library, account, chainId)

  return tokenContract
}

async function _getTokenByte32Contract(params: GetTokenInfoParams): Promise<Contract> {
  const { address, account, chainId, library } = params

  const tokenContract =
    bytes32ContractsCache[address] || getBytes32TokenContract(address, undefined, library, account, chainId)

  return tokenContract
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

  const [nameSettled, symbolSettled] = await Promise.allSettled([namePromise, symbolPromise])

  let name, symbol
  // If no name or symbol, try the bytes32 contract
  if (
    nameSettled.status === 'rejected' ||
    !nameSettled.value ||
    symbolSettled.status === 'rejected' ||
    !symbolSettled.value
  ) {
    console.debug(
      `[useTokenLazy::callback] name or symbol failed, trying bytes32`,
      address,
      account,
      chainId,
      nameSettled,
      symbolSettled
    )

    const bytes32Contract = await _getTokenByte32Contract(params)
    const [nameBytes32Settled, symbolBytes32Settled] = await Promise.allSettled([
      retry<string>(bytes32Contract.name, RETRY_OPTIONS).promise,
      retry<string>(bytes32Contract.symbol, RETRY_OPTIONS).promise,
    ])

    // Merge regular and bytes32 versions in case one them was good
    name = parseStringOrBytes32(
      nameSettled.status === 'fulfilled' ? nameSettled.value : '',
      nameBytes32Settled.status === 'fulfilled' ? nameBytes32Settled.value : '',
      'Unknown Token'
    )
    symbol = parseStringOrBytes32(
      symbolSettled.status === 'fulfilled' ? symbolSettled.value : '',
      symbolBytes32Settled.status === 'fulfilled' ? (symbolBytes32Settled.value as any) : '',
      'UNKNOWN'
    )
  } else {
    name = nameSettled.value
    symbol = symbolSettled.value
  }

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

      if (!account || !chainId || !address) {
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
