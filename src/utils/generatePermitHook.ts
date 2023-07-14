import { Erc20Abi } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'
import { MaxUint256, Token } from '@uniswap/sdk-core'

import { splitSignature } from 'ethers/lib/utils'

import { GP_VAULT_RELAYER } from 'legacy/constants'
import { getContract } from 'legacy/utils'

import { toKeccak256 } from '../modules/appData/utils/buildAppData'

export interface PermitHookParams {
  inputToken: Token
  provider: Web3Provider
  account: string
  chainId: SupportedChainId
}

const cachePrefix = 'permitCache-'
const pendingRequests: { [permitKey: string]: Promise<string> | undefined } = {}

export async function generatePermitHook(params: PermitHookParams): Promise<string> {
  const { inputToken, chainId, account, provider } = params
  const permitKey = `${cachePrefix}${inputToken.address.toLowerCase()}-${account}-${chainId}`

  if (localStorage.getItem(permitKey)) return localStorage.getItem(permitKey)!
  if (pendingRequests[permitKey]) return pendingRequests[permitKey]!

  const request = new Promise<string>(async (resolve) => {
    const sellTokenContract = getContract(inputToken.address, Erc20Abi, provider, account)

    const nonce = await sellTokenContract?.nonces(account)

    const permit = {
      owner: account,
      spender: GP_VAULT_RELAYER[chainId],
      value: MaxUint256.toString(),
      nonce: nonce ? nonce.toString() : '0',
      deadline: MaxUint256.toString(),
    }
    const permitSignature = splitSignature(
      await provider.getSigner()._signTypedData(
        {
          name: inputToken.name,
          chainId: inputToken.chainId,
          verifyingContract: inputToken.address,
        },
        {
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        permit
      )
    )

    const permitParams = [
      permit.owner,
      permit.spender,
      permit.value,
      permit.deadline,
      permitSignature.v,
      permitSignature.r,
      permitSignature.s,
    ]

    const permitHookData = {
      target: inputToken.address,
      callData: sellTokenContract.interface.encodeFunctionData('permit', permitParams as any),
      gasLimit: `${await sellTokenContract.estimateGas['permit'](...permitParams)}`,
    }

    const permitHook = JSON.stringify({
      backend: {
        hooks: {
          pre: [permitHookData],
          post: [],
        },
      },
    })

    const permitHookHash = toKeccak256(permitHook)
    console.log('permitHook', { permitHookHash, permitHook })
    localStorage.setItem(permitKey, permitHook)

    resolve(permitHook)
  })

  pendingRequests[permitKey] = request

  return request
}
