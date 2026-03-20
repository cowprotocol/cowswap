import { PERMIT_HOOK_DAPP_ID } from '@cowprotocol/hook-dapp-lib'

import { Address, Hex } from 'viem'
import { estimateGas } from 'wagmi/actions'

import { DEFAULT_PERMIT_GAS_LIMIT, DEFAULT_PERMIT_VALUE, PERMIT_ACCOUNT } from '../const'
import { PermitHookData, PermitHookParams } from '../types'
import { buildDaiLikePermitCallData, buildEip2612PermitCallData } from '../utils/buildPermitCallData'
import { getPermitDeadline } from '../utils/getPermitDeadline'
import { isSupportedPermitInfo } from '../utils/isSupportedPermitInfo'

import type { Config } from 'wagmi'

const REQUESTS_CACHE: { [permitKey: string]: Promise<PermitHookData | undefined> } = {}

export async function generatePermitHook(params: PermitHookParams): Promise<PermitHookData | undefined> {
  const permitKey = getCacheKey(params)

  const cachedRequest = REQUESTS_CACHE[permitKey]

  if (cachedRequest) {
    return await cachedRequest
  }

  const request = generatePermitHookRaw(params)
    .catch((e) => {
      console.debug(`[generatePermitHook] cached request failed`, e)
      return undefined
    })
    .finally(() => {
      // Remove consumed request to avoid stale data
      delete REQUESTS_CACHE[permitKey]
    })

  REQUESTS_CACHE[permitKey] = request

  return request
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
  } catch (e) {
    console.debug(`[calculatePermitGasLimit] Failed to estimateGas, using default`, e)

    return DEFAULT_PERMIT_GAS_LIMIT
  }
}

function getCacheKey(params: PermitHookParams): string {
  const { inputToken, chainId, account, amount } = params
  return `${inputToken.address.toLowerCase()}-${chainId}${account ? `-${account.toLowerCase()}` : ''}${amount ? `-${amount.toString()}` : ''}`
}
