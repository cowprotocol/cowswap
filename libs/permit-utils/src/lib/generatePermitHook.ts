import { JsonRpcProvider } from '@ethersproject/providers'

import { DEFAULT_PERMIT_GAS_LIMIT, DEFAULT_PERMIT_VALUE, PERMIT_SIGNER } from '../const'
import { PermitHookData, PermitHookParams } from '../types'
import { buildDaiLikePermitCallData, buildEip2612PermitCallData } from '../utils/buildPermitCallData'
import { getPermitDeadline } from '../utils/getPermitDeadline'
import { isSupportedPermitInfo } from '../utils/isSupportedPermitInfo'

// See hookDappsRegistry.json in @cowprotocol/hook-dapp-lib
const PERMIT_HOOK_DAPP_ID = 'PERMIT_TOKEN'

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

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
async function generatePermitHookRaw(params: PermitHookParams): Promise<PermitHookData> {
  const { inputToken, spender, chainId, permitInfo, provider, account, eip2612Utils, nonce: preFetchedNonce } = params

  const tokenAddress = inputToken.address
  // TODO: remove the need for `name` from input token. Should come from permitInfo instead
  const tokenName = permitInfo.name || inputToken.name

  if (!isSupportedPermitInfo(permitInfo)) {
    throw new Error(`Trying to generate permit hook for unsupported token: ${tokenAddress}`)
  }

  if (!tokenName) {
    throw new Error(`No token name for token: ${tokenAddress}`)
  }

  const owner = account || PERMIT_SIGNER.address

  // Only fetch the nonce in case it wasn't pre-fetched before
  // That's the case for static account
  const nonce = preFetchedNonce === undefined ? await eip2612Utils.getTokenNonce(tokenAddress, owner) : preFetchedNonce

  const deadline = getPermitDeadline()
  const value = DEFAULT_PERMIT_VALUE

  const callData =
    permitInfo.type === 'eip-2612'
      ? await buildEip2612PermitCallData({
          eip2612Utils,
          callDataParams: [
            {
              owner,
              spender,
              value,
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
              value,
              nonce,
              expiry: deadline,
            },
            chainId as number,
            tokenName,
            tokenAddress,
            permitInfo.version,
          ],
        })

  const gasLimit = await calculateGasLimit(callData, owner, tokenAddress, provider, !!account)

  return {
    target: tokenAddress,
    callData,
    gasLimit,
    dappId: PERMIT_HOOK_DAPP_ID,
  }
}

async function calculateGasLimit(
  data: string,
  from: string,
  to: string,
  provider: JsonRpcProvider,
  isUserAccount: boolean,
): Promise<string> {
  try {
    // Query the actual gas estimate
    const actual = await provider.estimateGas({ data, from, to })

    // Add 10% to actual value to account for minor differences with real account
    // Do not add it if this is the real user's account
    const gasLimit = !isUserAccount ? actual.add(actual.div(10)) : actual

    // Pick the biggest between estimated and default
    return gasLimit.gt(DEFAULT_PERMIT_GAS_LIMIT) ? gasLimit.toString() : DEFAULT_PERMIT_GAS_LIMIT
  } catch (e) {
    console.debug(`[calculatePermitGasLimit] Failed to estimateGas, using default`, e)

    return DEFAULT_PERMIT_GAS_LIMIT
  }
}

function getCacheKey(params: PermitHookParams): string {
  const { inputToken, chainId, account } = params

  return `${inputToken.address.toLowerCase()}-${chainId}${account ? `-${account.toLowerCase()}` : ''}`
}
