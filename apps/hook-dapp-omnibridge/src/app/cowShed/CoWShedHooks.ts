import {
  EcdsaSigningScheme,
  hashTypedData,
  isTypedDataSigner,
  SigningScheme,
  TypedDataTypes,
} from '@cowprotocol/contracts'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Signer } from '@ethersproject/abstract-signer'
import { BigNumberish } from '@ethersproject/bignumber'
import { BytesLike } from '@ethersproject/bytes'

import { arrayify, joinSignature, splitSignature } from 'ethers/lib/utils'

import { COW_SHED_FACTORY, COW_SHED_IMPLEMENTATION } from './consts'
import { getCoWShedFactoryInterface } from './contracts'
import { CoWShedFactory__factory } from './generated'
import { COW_SHED_712_TYPES, ICoWShedCall, ICoWShedOptions } from './types'

export interface TypedDataDomain {
  name?: string
  version?: string
  chainId?: BigNumberish
  verifyingContract?: string
  salt?: BytesLike
}

export class CowShedHooks {
  constructor(
    private chainId: SupportedChainId,
    private customOptions?: ICoWShedOptions,
  ) {}

  async computeProxyAddress(user: string, signer: Signer): Promise<string> {
    // TODO: cache the instance
    const coWShedFactory = CoWShedFactory__factory.connect(COW_SHED_FACTORY, signer)

    return coWShedFactory.callStatic.proxyOf(user)
  }

  encodeExecuteHooksForFactory(
    calls: ICoWShedCall[],
    nonce: string,
    deadline: bigint,
    user: string,
    signature: string,
  ): string {
    return getCoWShedFactoryInterface().encodeFunctionData('executeHooks', [calls, nonce, deadline, user, signature])
  }

  async signCalls(
    calls: ICoWShedCall[],
    nonce: string,
    deadline: bigint,
    signer: Signer,
    signingScheme: EcdsaSigningScheme,
  ): Promise<string> {
    const user = await signer.getAddress()
    const proxy = await this.computeProxyAddress(user, signer)

    const { domain, types, message } = this.infoToSign(calls, nonce, deadline, proxy)

    return await ecdsaSignTypedData(signingScheme, signer, domain, types, message)
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  infoToSign(calls: ICoWShedCall[], nonce: string, deadline: bigint, proxy: string) {
    const message = {
      calls,
      nonce,
      deadline,
    }
    return { domain: this.getDomain(proxy), types: COW_SHED_712_TYPES, message }
  }

  getDomain(proxy: string): TypedDataDomain {
    const domain: TypedDataDomain = {
      name: 'COWShed',
      version: '1.0.0',
      chainId: this.chainId,
      verifyingContract: proxy,
    }
    return domain
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getFactoryAddress() {
    return this.customOptions?.factoryAddress ?? COW_SHED_FACTORY
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getImplementationAddress() {
    return this.customOptions?.implementationAddress ?? COW_SHED_IMPLEMENTATION
  }
}

// code copied from @cow/contract (not exported there)
async function ecdsaSignTypedData(
  scheme: EcdsaSigningScheme,
  owner: Signer,
  domain: TypedDataDomain,
  types: TypedDataTypes,
  data: Record<string, unknown>,
): Promise<string> {
  let signature: string | null = null

  switch (scheme) {
    case SigningScheme.EIP712:
      if (!isTypedDataSigner(owner)) {
        throw new Error('signer does not support signing typed data')
      }
      signature = await owner._signTypedData(domain, types, data)
      break
    case SigningScheme.ETHSIGN:
      signature = await owner.signMessage(arrayify(hashTypedData(domain, types, data)))
      break
    default:
      throw new Error('invalid signing scheme')
  }

  // Passing the signature through split/join to normalize the `v` byte.
  // Some wallets do not pad it with `27`, which causes a signature failure
  // `splitSignature` pads it if needed, and `joinSignature` simply puts it back together
  return joinSignature(splitSignature(signature))
}
