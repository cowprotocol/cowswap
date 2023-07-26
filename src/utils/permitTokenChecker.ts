import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { defaultAbiCoder, ParamType } from '@ethersproject/abi'
import type { Web3Provider } from '@ethersproject/providers'

import {
  AbiItem,
  DAI_LIKE_PERMIT_TYPEHASH,
  Eip2612PermitUtils,
  EIP712TypedData,
  ProviderConnector,
} from '@1inch/permit-signed-approvals-utils'
import { AbiInput } from 'web3-utils'

import { GP_VAULT_RELAYER, NATIVE_CURRENCY_BUY_ADDRESS } from '../legacy/constants'
import { getContract } from '../legacy/utils'

const permitGasLimitMin: Record<SupportedChainId, number> = {
  1: 55_000,
  100: 55_000,
  5: 55_000,
}

const permitParams = {
  value: '985090000000000000',
  nonce: 0,
  deadline: Math.ceil(Date.now() / 1000) + 50_000,
}

const daiLikePermitParams = {
  allowed: true,
  nonce: 0,
  expiry: Math.ceil(Date.now() / 1000) + 50_000,
}

export function estimatePermit(
  tokenAddress: string,
  tokenName: string,
  chainId: SupportedChainId,
  walletAddress: string,
  provider: Web3Provider
) {
  if (NATIVE_CURRENCY_BUY_ADDRESS.toLowerCase() === tokenAddress.toLowerCase()) {
    return Promise.resolve({
      token: tokenAddress,
      supported: false,
    })
  }

  const spender = GP_VAULT_RELAYER[chainId]
  const web3ProviderConnector = new Web3ProviderConnector(provider)
  const eip2612PermitUtils = new Eip2612PermitUtils(web3ProviderConnector)

  return eip2612PermitUtils
    .getTokenNonce(tokenAddress, walletAddress)
    .then((nonce) => {
      return eip2612PermitUtils.buildPermitCallData(
        {
          ...permitParams,
          owner: walletAddress,
          spender,
          nonce,
        },
        +chainId,
        tokenName,
        tokenAddress
      )
    })
    .then((data) => {
      return provider.estimateGas({
        data: data.replace('0x', '0xd505accf'),
        from: walletAddress,
        to: tokenAddress,
      })
    })
    .catch((_error) => {
      return estimateDaiLikeToken(
        tokenAddress,
        tokenName,
        chainId,
        walletAddress,
        spender,
        provider,
        eip2612PermitUtils
      )
    })
    .catch((error) => {
      return {
        token: tokenAddress,
        supported: false,
        gasLimit: 0,
        error,
      }
    })
    .then((res) => {
      if (typeof res === 'object' && res && 'token' in res && res.token && res.error) {
        return res
      }

      return {
        token: tokenAddress,
        supported: typeof res === 'number' && res > permitGasLimitMin[chainId],
        gasLimit: res,
      }
    })
}

function estimateDaiLikeToken(
  tokenAddress: string,
  tokenName: string,
  chainId: SupportedChainId,
  walletAddress: string,
  spender: string,
  provider: Web3Provider,
  eip2612PermitUtils: Eip2612PermitUtils
) {
  return eip2612PermitUtils.getPermitTypeHash(tokenAddress).then((permitTypeHash) => {
    return permitTypeHash === DAI_LIKE_PERMIT_TYPEHASH
      ? eip2612PermitUtils
          .getTokenNonce(tokenAddress, walletAddress)
          .then((nonce) => {
            return eip2612PermitUtils.buildDaiLikePermitCallData(
              {
                ...daiLikePermitParams,
                holder: walletAddress,
                spender,
                nonce,
              },
              chainId as number,
              tokenName,
              tokenAddress
            )
          })
          .then((daiLikeData) => {
            return provider.estimateGas({
              data: daiLikeData.replace('0x', '0x8fcbaf0c'),
              from: walletAddress,
              to: tokenAddress,
            })
          })
      : null
  })
}

export class Web3ProviderConnector implements ProviderConnector {
  constructor(private provider: Web3Provider) {}

  contractEncodeABI(abi: AbiItem[], address: string | null, methodName: string, methodParams: unknown[]): string {
    const contract = getContract(address || '', abi, this.provider)

    return contract.methods[methodName](...methodParams).encodeABI()
  }

  signTypedData(_walletAddress: string, typedData: EIP712TypedData, _typedDataHash: string): Promise<string> {
    return this.provider.getSigner()._signTypedData(typedData.domain, typedData.types, typedData.message)
  }

  ethCall(contractAddress: string, callData: string): Promise<string> {
    return this.provider.call({
      to: contractAddress,
      data: callData,
    })
  }

  decodeABIParameter<T>(type: string, hex: string): T {
    return defaultAbiCoder.decode([type], hex)[0]
  }
  decodeABIParameters<T>(types: AbiInput[], hex: string): T {
    return defaultAbiCoder.decode(types as unknown as (ParamType | string)[], hex) as T
  }
}
