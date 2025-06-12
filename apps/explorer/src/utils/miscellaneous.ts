import { Command } from '@cowprotocol/types'

import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { DEFAULT_TIMEOUT, NATIVE_TOKEN_ADDRESS } from 'const'
import { Network, Unpromise } from 'types'
import Web3 from 'web3'

import { AssertionError } from 'assert'

const toChecksumAddress = Web3.utils.toChecksumAddress

export function assertNonNull<T>(val: T, message: string): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new AssertionError({ message })
  }
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function noop(..._args: any[]): void {}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logInfo = process.env.NODE_ENV === 'test' ? noop : (...args: any[]): void => console.log(...args)

let debugEnabled = process.env.NODE_ENV === 'development'

declare global {
  interface Window {
    toggleDebug: Command
  }
}

window.toggleDebug = (): boolean => {
  debugEnabled = !debugEnabled
  return debugEnabled
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logDebug = (...args: any[]): void => {
  if (debugEnabled) {
    console.log(...args)
  }
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debug = process.env.NODE_ENV === 'development' ? noop : (...args: any[]): void => console.log(...args)

export const delay = <T = void>(ms = 100, result?: T): Promise<T> =>
  new Promise((resolve) => setTimeout(resolve, ms, result))

/**
 * Uses images from https://github.com/trustwallet/tokens
 */
export function getImageUrl(tokenAddress?: string): string | undefined {
  if (!tokenAddress) return undefined
  try {
    const checksummedAddress = toChecksumAddress(tokenAddress)
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksummedAddress}/logo.png`
  } catch {
    return undefined
  }
}

export function isNativeToken(address: string): boolean {
  return address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
}

const NetworkImageAddressMap: Record<Network, string> = {
  [Network.MAINNET]: 'eth',
  [Network.BASE]: 'eth',
  [Network.ARBITRUM_ONE]: 'eth',
  [Network.GNOSIS_CHAIN]: 'xdai',
  [Network.POLYGON]: 'pol',
  [Network.AVALANCHE]: 'avax',
  [Network.SEPOLIA]: 'eth',
}

export function getImageAddress(address: string, network: Network): string {
  if (isNativeToken(address)) {
    // What is going on here?
    // Well, this address here is the path on `src/assets/tokens/`
    // So these special values will use the local images,
    // because they are native tokens and don't really have an address
    return NetworkImageAddressMap[network]
  }
  return address
}

export async function silentPromise<T>(promise: Promise<T>, customMessage?: string): Promise<T | undefined> {
  try {
    return await promise
  } catch (e) {
    logDebug(customMessage || 'Failed to fetch promise', e.message)
    return
  }
}

export function setStorageItem(key: string, data: unknown): void {
  // localStorage API accepts only strings
  const formattedData = JSON.stringify(data)
  return localStorage.setItem(key, formattedData)
}

interface RetryOptions {
  retriesLeft?: number
  interval?: number
  exponentialBackOff?: boolean
}

/**
 * Retry function with delay.
 *
 * Inspired by: https://gitlab.com/snippets/1775781
 *
 * @param fn Parameterless function to retry
 * @param retriesLeft How many retries. Defaults to 3
 * @param interval How long to wait between retries. Defaults to 1s
 * @param exponentialBackOff Whether to use exponential back off, doubling wait interval. Defaults to true
 */

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function retry<T extends () => any>(fn: T, options?: RetryOptions): Promise<Unpromise<ReturnType<T>>> {
  const { retriesLeft = 3, interval = 1000, exponentialBackOff = true } = options || {}

  try {
    return await fn()
  } catch {
    if (retriesLeft) {
      await delay(interval)

      return retry(fn, {
        retriesLeft: retriesLeft - 1,
        interval: exponentialBackOff ? interval * 2 : interval,
        exponentialBackOff,
      })
    } else {
      throw new Error(`Max retries reached`)
    }
  }
}

export function flattenMapOfLists<K, T>(map: Map<K, T[]>): T[] {
  return Array.from(map.values()).reduce<T[]>((acc, list) => acc.concat(list), [])
}

export function flattenMapOfSets<K, T>(map: Map<K, Set<T>>): T[] {
  return Array.from(map.values()).reduce<T[]>((acc, set) => acc.concat(Array.from(set)), [])
}

export function divideBN(numerator: BN, denominator: BN): BigNumber {
  return new BigNumber(numerator.toString()).dividedBy(denominator.toString())
}

export const RequireContextMock = Object.assign(() => '', {
  keys: () => [],
  resolve: () => '',
  id: '',
})

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export const isNonZeroNumber = (value?: string | number): boolean => !!value && !!+value

export interface TimeoutParams<T> {
  time?: number
  result?: T
  timeoutErrorMsg?: string
}

export function timeout(params: TimeoutParams<undefined>): Promise<never> // never means function throws
export function timeout<T>(params: TimeoutParams<T extends undefined ? never : T>): Promise<T>
export async function timeout<T>(params: TimeoutParams<T>): Promise<T | never> {
  const { time = DEFAULT_TIMEOUT, result, timeoutErrorMsg: timeoutMsg = 'Timeout' } = params

  await delay(time)
  // provided defined result -- return it
  if (result !== undefined) return result
  // no defined result -- throw message
  throw new Error(timeoutMsg)
}

/**
 * Check if a string is an orderId against regex
 *
 * @param text Possible OrderId string to check
 */
export const isAnOrderId = (text: string): boolean => text.match(/^0x[a-fA-F0-9]{112}$/)?.input !== undefined

/**
 * Check if string is an address account against regex
 *
 * @param text Possible address string to check
 */
export const isAnAddressAccount = (text: string): boolean => {
  if (isEns(text)) {
    return true
  } else {
    return text.match(/^0x[a-fA-F0-9]{40}$/)?.input !== undefined
  }
}

/**
 * Check if string is a valid ENS address against regex
 *
 * @param text Possible ENS address string to check
 * @returns true if valid or false if not
 */
export const isEns = (text: string): boolean => text.match(/[a-zA-Z0-9]+\.[a-zA-Z]+$/)?.input !== undefined

/**
 * Check if a string is a valid Tx Hash against regex
 *
 * @param text Possible TxHash string to check
 * @returns true if valid or false if not
 */
export const isATxHash = (text: string): boolean => text.match(/^(0x)?([a-fA-F0-9]{64})$/)?.input !== undefined

/** Convert string to lowercase and remove whitespace */
export function cleanNetworkName(networkName: string | undefined): string {
  if (!networkName) return ''

  return networkName.replace(/\s+/g, '').toLowerCase()
}
/**
 * Returns the difference in percentage between two numbers
 *
 * @export
 * @param {number} a
 * @param {number} b
 * @return {*}  {number}
 */
export function getPercentageDifference(a: number, b: number): number {
  const result = b ? ((a - b) / b) * 100 : 0

  if (Number.isNaN(result)) {
    return 0
  }

  return result
}
