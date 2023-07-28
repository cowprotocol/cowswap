import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { defaultAbiCoder, ParamType } from '@ethersproject/abi'
import { TypedDataField } from '@ethersproject/abstract-signer'
import type { Web3Provider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

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

export type EstimatePermitResult =
  // When it's a permittable token:
  | {
      type: 'dai' | 'permit'
      gasLimit: number
    }
  // When something failed:
  | { error: string }
  // When it's not permittable:
  | null

const FAKE_SIGNER = buildFakeSigner()

export async function estimatePermit(
  tokenAddress: string,
  tokenName: string,
  chainId: SupportedChainId,
  provider: Web3Provider
): Promise<EstimatePermitResult> {
  if (NATIVE_CURRENCY_BUY_ADDRESS.toLowerCase() === tokenAddress.toLowerCase()) {
    // We shouldn't call this for the native token, but just in case
    return null
  }

  const spender = GP_VAULT_RELAYER[chainId]

  const web3ProviderConnector = new Web3ProviderConnector(provider, FAKE_SIGNER)
  const eip2612PermitUtils = new Eip2612PermitUtils(web3ProviderConnector)

  const owner = FAKE_SIGNER.address

  try {
    const nonce = await eip2612PermitUtils.getTokenNonce(tokenAddress, owner)

    const permitCallData = await eip2612PermitUtils.buildPermitCallData(
      {
        ...permitParams,
        owner,
        spender,
        nonce,
      },
      +chainId,
      tokenName,
      tokenAddress
    )

    const estimatedGas = await provider.estimateGas({
      data: permitCallData.replace('0x', '0xd505accf'),
      from: owner,
      to: tokenAddress,
    })

    const gasLimit = estimatedGas.toNumber()

    // TODO: I'm not sure why this is needed, check with Sasha
    return gasLimit > permitGasLimitMin[chainId]
      ? {
          type: 'permit',
          gasLimit,
        }
      : null
  } catch (e) {
    console.debug(`bug--estimatePermit--error1`, e)
    try {
      return await estimateDaiLikeToken(tokenAddress, tokenName, chainId, owner, spender, provider, eip2612PermitUtils)
    } catch (e) {
      console.debug(`bug--estimatePermit--error2`, e)
      return { error: e.toString() }
    }
  }
}

function estimateDaiLikeToken(
  tokenAddress: string,
  tokenName: string,
  chainId: SupportedChainId,
  walletAddress: string,
  spender: string,
  provider: Web3Provider,
  eip2612PermitUtils: Eip2612PermitUtils
): Promise<EstimatePermitResult> {
  return eip2612PermitUtils.getPermitTypeHash(tokenAddress).then((permitTypeHash) => {
    return permitTypeHash === DAI_LIKE_PERMIT_TYPEHASH
      ? eip2612PermitUtils
          .getTokenNonce(tokenAddress, walletAddress)
          .then((nonce) =>
            eip2612PermitUtils.buildDaiLikePermitCallData(
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
          )
          .then((daiLikeData) =>
            provider.estimateGas({
              data: daiLikeData.replace('0x', '0x8fcbaf0c'),
              from: walletAddress,
              to: tokenAddress,
            })
          )
          .then((res) => {
            const gasLimit = res.toNumber()

            // TODO: I'm not sure why this is needed, check with Sasha
            return gasLimit > permitGasLimitMin[chainId]
              ? {
                  gasLimit,
                  type: 'dai',
                }
              : null
          })
      : null
  })
}

export class Web3ProviderConnector implements ProviderConnector {
  constructor(private provider: Web3Provider, private walletSigner?: Wallet | undefined) {}

  contractEncodeABI(abi: AbiItem[], address: string | null, methodName: string, methodParams: unknown[]): string {
    const contract = getContract(address || '', abi, this.provider)

    return contract.interface.encodeFunctionData(methodName, methodParams)
  }

  signTypedData(_walletAddress: string, typedData: EIP712TypedData, _typedDataHash: string): Promise<string> {
    // Removes `EIP712Domain` as it's already part of EIP712 (see https://ethereum.stackexchange.com/a/151930/55204)
    // and EthersJS complains when a type is not needed (see https://github.com/ethers-io/ethers.js/discussions/4000)
    const types = Object.keys(typedData.types).reduce<Record<string, TypedDataField[]>>((acc, type) => {
      if (type !== 'EIP712Domain') {
        acc[type] = typedData.types[type]
      }
      return acc
    }, {})

    const signer = this.walletSigner || this.provider.getSigner()

    return signer._signTypedData(typedData.domain, types, typedData.message)
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

/**
 * Builds a fake EthersJS Wallet signer to use with EIP2612 Permit
 */
export function buildFakeSigner(): Wallet {
  return Wallet.createRandom()
}
