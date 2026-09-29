import { Address, BaseError, ExecutionRevertedError, Hex } from 'viem'
import type { Config } from 'wagmi'
import { estimateGas } from 'wagmi/actions'

import { PERMIT_HOOK_DAPP_ID } from '@cowprotocol/hook-dapp-lib'

import { DEFAULT_PERMIT_GAS_LIMIT, DEFAULT_PERMIT_VALUE, PERMIT_ACCOUNT } from '../const'
import { PermitHookData, PermitHookParams } from '../types'
import { buildDaiLikePermitCallData, buildEip2612PermitCallData } from '../utils/buildPermitCallData'
import { getPermitDeadline } from '../utils/getPermitDeadline'
import { isSupportedPermitInfo } from '../utils/isSupportedPermitInfo'

type NormalizedError = Error & { code?: number }

const REQUESTS_CACHE: { [permitKey: string]: Promise<PermitHookData | undefined> } = {}

// User rejection detection (EIP-1193 error codes and common wallet messages)
const USER_REJECTION_CODES = [4001, -32000]
const USER_REJECTION_MESSAGES = ['user denied', 'user rejected', 'rejected transaction', 'transaction was rejected']

export async function generatePermitHook(params: PermitHookParams): Promise<PermitHookData | undefined> {
  const permitKey = getCacheKey(params)

  const cachedRequest = REQUESTS_CACHE[permitKey]

  if (cachedRequest) {
    return await cachedRequest
  }

  const request = generatePermitHookRaw(params)
    .catch((err: unknown) => {
      const error = normalizeError(err)

      // Re-throw user rejection errors so they propagate to the UI
      if (isUserRejectionError(error) || error instanceof ExecutionRevertedError) {
        throw error
      }
      console.debug(`[generatePermitHook] cached request failed`, error)
      return undefined
    })
    .finally(() => {
      // Remove consumed request to avoid stale data
      delete REQUESTS_CACHE[permitKey]
    })

  REQUESTS_CACHE[permitKey] = request

  return request
}

async function calculateGasLimit({
  data,
  from,
  to,
  config,
  isUserAccount,
}: {
  data: Hex
  from: Address
  to: Address
  config: Config
  isUserAccount: boolean
}): Promise<bigint> {
  try {
    // Query the actual gas estimate
    const actual = await estimateGas(config, { account: from, to, data })

    // Add 10% to actual value to account for minor differences with real account
    // Do not add it if this is the real user's account
    const gasLimit = !isUserAccount ? actual + actual / 10n : actual

    // Pick the biggest between estimated and default
    return gasLimit > DEFAULT_PERMIT_GAS_LIMIT ? gasLimit : DEFAULT_PERMIT_GAS_LIMIT
  } catch (err: unknown) {
    const error = normalizeError(err)
    const revertError = isUserAccount ? getExecutionRevertedError(error) : undefined
    if (revertError) throw revertError

    console.debug(`[calculatePermitGasLimit] Failed to estimateGas, using default`, error)

    return DEFAULT_PERMIT_GAS_LIMIT
  }
}

async function generatePermitHookRaw(params: PermitHookParams): Promise<PermitHookData> {
  const { inputToken, spender, chainId, permitInfo, config, account, eip2612Utils, nonce: preFetchedNonce } = params

  const tokenAddress = inputToken.address
  // TODO: remove the need for `name` from input token. Should come from permitInfo instead
  const tokenName = permitInfo.name || inputToken.name

  if (!isSupportedPermitInfo(permitInfo)) {
    throw new Error(`Trying to generate permit hook for unsupported token: ${tokenAddress}`)
  }

  if (!tokenName) {
    throw new Error(`No token name for token: ${tokenAddress}`)
  }

  const owner = account || PERMIT_ACCOUNT.address

  // Only fetch the nonce in case it wasn't pre-fetched before
  // That's the case for static account
  const nonce = preFetchedNonce === undefined ? await eip2612Utils.getTokenNonce(tokenAddress, owner) : preFetchedNonce

  const deadline = getPermitDeadline()
  const value = params.amount || DEFAULT_PERMIT_VALUE

  const callData =
    permitInfo.type === 'eip-2612'
      ? await buildEip2612PermitCallData({
          eip2612Utils,
          callDataParams: [
            {
              owner,
              spender,
              value: value.toString(),
              nonce,
              deadline,
            },
            chainId as number,
            tokenName,
            tokenAddress,
            permitInfo.version,
          ],
        })
      : await buildDaiLikePermitCallData({
          eip2612Utils,
          callDataParams: [
            {
              holder: owner,
              spender,
              allowed: true,
              value: value.toString(),
              nonce,
              expiry: deadline,
            },
            chainId as number,
            tokenName,
            tokenAddress,
            permitInfo.version,
          ],
        })

  const gasLimit = await calculateGasLimit({
    data: callData,
    from: owner,
    to: tokenAddress,
    config,
    isUserAccount: !!account,
  })

  return {
    target: tokenAddress,
    callData,
    gasLimit: gasLimit.toString(),
    dappId: PERMIT_HOOK_DAPP_ID,
  }
}

function getCacheKey(params: PermitHookParams): string {
  const { inputToken, chainId, account, amount } = params
  return `${inputToken.address.toLowerCase()}-${chainId}${account ? `-${account.toLowerCase()}` : ''}${amount ? `-${amount.toString()}` : ''}`
}

function getExecutionRevertedError(error: unknown): ExecutionRevertedError | undefined {
  if (!(error instanceof BaseError)) return undefined

  const revertError = error.walk((cause) => cause instanceof ExecutionRevertedError)

  return revertError instanceof ExecutionRevertedError ? revertError : undefined
}

function isUserRejectionError(error: NormalizedError): boolean {
  if (error.code !== undefined && USER_REJECTION_CODES.includes(error.code)) return true

  const message = error.message.toLowerCase()
  return USER_REJECTION_MESSAGES.some((msg) => message.includes(msg))
}

// Keep this local: permit-utils is buildable, while common-utils is not.
function normalizeError(err: unknown): NormalizedError {
  if (err instanceof Error) return err

  const message =
    typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string'
      ? err.message
      : String(err)
  const error = new Error(message) as NormalizedError

  if (typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'number') {
    error.code = err.code
  }

  return error
}
