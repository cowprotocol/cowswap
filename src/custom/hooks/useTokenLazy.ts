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
import { RetryResult } from 'types/index'

const DEFAULT_TOKEN_NAME = 'Unknown Token'
const DEFAULT_TOKEN_SYMBOL = 'UNKNOWN'
const NO_TOKEN_INFO = { promise: Promise.resolve(null), cancel: () => {} } // eslint-disable-line

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

function _tryGetToken(params: GetTokenInfoParams): { promise: Promise<TokenInfo | null>; cancel: () => void } {
  // Fetch each property individually
  let cancel: () => void | undefined
  const promise = _getTokenContract(params)
    .then((contract) => {
      const { promise: decimalsPromise, cancel: cancelDecimalsPromise } = retry(contract.decimals, RETRY_OPTIONS)
      const { promise: namePromise, cancel: cancelNamePromise } = retry(contract.name, RETRY_OPTIONS)
      const { promise: symbolPromise, cancel: cancelSymbolPromise } = retry(contract.symbol, RETRY_OPTIONS)

      cancel = () => {
        cancelDecimalsPromise()
        cancelNamePromise()
        cancelSymbolPromise()
      }
      return decimalsPromise.then((decimals) => {
        return Promise.allSettled([namePromise, symbolPromise]).then(([nameSettled, symbolSettled]) => {
          let name
          if (nameSettled.status === 'fulfilled' && nameSettled.value) {
            name = nameSettled.value
          }

          let symbol
          if (symbolSettled.status === 'fulfilled' && symbolSettled.value) {
            symbol = symbolSettled.value
          }

          return {
            decimals,
            name,
            symbol,
          }
        })
      })
    })
    .catch((e) => {
      const { address, account, chainId } = params
      console.debug(`[useTokenLazy::callback] no decimals, stopping`, address, account, chainId, e)

      if (cancel) {
        cancel()
      }
      return null
    })

  return { promise, cancel: () => cancel && cancel() }
}

function _tryGetFieldByte32(
  params: GetTokenInfoParams,
  bytes32Contract: Contract,
  contractField: string,
  defaultValue: string
): { promise: Promise<string>; cancel: () => void } {
  const { address, account, chainId } = params
  console.debug(`[useTokenLazy::callback] "${contractField}" fetch failed, trying bytes32`, address, account, chainId)
  const { promise, cancel } = retry<string>(bytes32Contract[contractField], RETRY_OPTIONS)

  const getFieldPromise = promise
    .then((name) => parseStringOrBytes32(undefined, name, DEFAULT_TOKEN_NAME))
    .catch(() => {
      console.debug(
        `[useTokenLazy::callback] "${contractField}" fetch failed also as bytes32`,
        address,
        account,
        chainId
      )
      return defaultValue
    })

  return { promise: getFieldPromise, cancel }
}

function _getTokenInfo(params: GetTokenInfoParams): { promise: Promise<TokenInfo | null>; cancel: () => void } {
  const { address, account, chainId } = params
  console.debug(`[useTokenLazy::callback] input is valid`, address, account, chainId)

  // Get token info
  const { promise: tryGetTokenPromise, cancel: cancelGetToken } = _tryGetToken(params)
  const allCancellations = [cancelGetToken]

  // Get token with some fallback logic
  const promise = tryGetTokenPromise.then(async (tokenInfo) => {
    // If no token info, return early
    if (!tokenInfo) {
      return null
    }

    const { decimals, symbol, name } = tokenInfo

    // Get name
    let namePromise
    if (!name) {
      // name is missing, try to get it as byte32
      const bytes32Contract = await _getTokenByte32Contract(params)
      const { promise, cancel } = _tryGetFieldByte32(params, bytes32Contract, 'name', DEFAULT_TOKEN_NAME)
      allCancellations.push(cancel)

      namePromise = promise
    } else {
      namePromise = name
    }

    // Get symbol
    let symbolPromise
    if (!symbol) {
      // symbol is missing, try to get it as byte32
      const bytes32Contract = await _getTokenByte32Contract(params)
      const { promise, cancel } = _tryGetFieldByte32(params, bytes32Contract, 'symbol', DEFAULT_TOKEN_SYMBOL)
      symbolPromise = promise
      allCancellations.push(cancel)
    } else {
      symbolPromise = symbol
    }

    // Wait for name and symbol promises
    const [nameFallback, symbolFallback] = await Promise.all([namePromise, symbolPromise])

    // Return the token info
    return { decimals, name: nameFallback, symbol: symbolFallback }
  })

  // Cancel any pending promise
  const cancel = () => allCancellations.forEach((cancel) => cancel())

  return { promise, cancel }
}

export type TokenGetter = (address: string) => RetryResult<Token | null>

/**
 * Hook that returns a callback which fetches data for a single token from the chain
 *
 * Alternative to hooks/Token/useToken where token address does not need to be known
 * at hook phase nor uses multicall
 */
export function useTokenLazy(): TokenGetter {
  const { library, account, chainId } = useActiveWeb3React()
  const addUserToken = useAddUserToken()

  return useCallback<TokenGetter>(
    (address) => {
      console.debug(`[useTokenLazy::callback] callback called`, address, account, chainId)

      if (!account || !chainId || !address || !library) {
        return NO_TOKEN_INFO
      }

      const { promise: getTokenPromise, cancel } = _getTokenInfo({ chainId, account, address, library })

      const promise = getTokenPromise.then((tokenInfo) => {
        if (!tokenInfo) {
          return null
        }

        const { decimals, symbol, name } = tokenInfo
        const token = new Token(chainId, address, decimals, symbol, name)

        console.debug(`[useTokenLazy::callback] loaded token`, address, account, chainId, token)

        addUserToken(token)

        return token
      })

      return { promise, cancel }
    },
    [account, addUserToken, chainId, library]
  )
}
