import {
  domain as domainGp,
  signOrder as signOrderGp,
  EcdsaSignature,
  Order,
  Signature,
  TypedDataV3Signer
} from '@gnosis.pm/gp-v2-contracts'
import { ChainId } from '@uniswap/sdk'

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from 'constants/index'
import { TypedDataDomain, Signer } from 'ethers'
import { registerOnWindow } from './misc'

export { OrderKind } from '@gnosis.pm/gp-v2-contracts'

// For error codes, see:
// - https://eth.wiki/json-rpc/json-rpc-error-codes-improvement-proposal
// - https://www.jsonrpc.org/specification#error_object
const METAMASK_SIGNATURE_ERROR_CODE = -32603
const METHOD_NOT_FOUND_ERROR_CODE = -32601
const V4_ERROR_MSG_REGEX = /eth_signTypedData_v4 does not exist/i
const V3_ERROR_MSG_REGEX = /eth_signTypedData_v3 does not exist/i
const RPC_REQUEST_FAILED_REGEX = /RPC request failed/i

export type UnsignedOrder = Omit<Order, 'receiver'> & { receiver: string }

export interface SignOrderParams {
  chainId: ChainId
  signer: Signer
  order: UnsignedOrder
  signingScheme: EcdsaSigningScheme
}

// posted to /api/v1/orders on Order creation
// serializable, so no BigNumbers
//  See https://protocol-rinkeby.dev.gnosisdev.com/api/
export interface OrderCreation extends UnsignedOrder {
  // TODO: I commented this because I expect the API and contract to follow the same structure for the order data. confirm and delete this comment
  signature: string // 65 bytes encoded as hex without `0x` prefix. v + r + s from the spec
  signingScheme: EcdsaSigningScheme // value of
}

// TODO: We cannot make use of the NPM exported enum for now. See https://babeljs.io/docs/en/babel-plugin-transform-typescript#caveats
// After https://github.com/gnosis/gp-v2-contracts/pull/568/files is published, we can use it and we should remove our own definition
export enum SigningScheme {
  /**
   * The EIP-712 typed data signing scheme. This is the preferred scheme as it
   * provides more infomation to wallets performing the signature on the data
   * being signed.
   *
   * <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-domainseparator>
   */
  EIP712,
  /**
   * Message signed using eth_sign RPC call.
   */
  ETHSIGN,
  /**
   * Smart contract signatures as defined in EIP-1271.
   *
   * <https://eips.ethereum.org/EIPS/eip-1271>
   */
  EIP1271,
  /**
   * Pre-signed order.
   */
  PRESIGN
}
export type EcdsaSigningScheme = SigningScheme.EIP712 | SigningScheme.ETHSIGN

interface SchemaInfo {
  libraryValue: number
  apiValue: string
}
const mapSigningSchema: Map<SigningScheme, SchemaInfo> = new Map([
  [SigningScheme.EIP712, { libraryValue: 0, apiValue: 'eip712' }],
  [SigningScheme.ETHSIGN, { libraryValue: 1, apiValue: 'ethsign' }]
])

function _getSigningSchemeInfo(ecdaSigningScheme: EcdsaSigningScheme): SchemaInfo {
  const value = mapSigningSchema.get(ecdaSigningScheme)
  if (value === undefined) {
    throw new Error('Unknown schema ' + ecdaSigningScheme)
  }

  return value
}

export function getSigningSchemeApiValue(ecdaSigningScheme: EcdsaSigningScheme): string {
  return _getSigningSchemeInfo(ecdaSigningScheme).apiValue
}

export function getSigningSchemeLibValue(ecdaSigningScheme: EcdsaSigningScheme): number {
  return _getSigningSchemeInfo(ecdaSigningScheme).libraryValue
}
// ---------------- end of the TODO:

function _getDomain(chainId: ChainId): TypedDataDomain {
  // Get settlement contract address
  const settlementContract = GP_SETTLEMENT_CONTRACT_ADDRESS[chainId]

  if (!settlementContract) {
    throw new Error('Unsupported network. Settlement contract is not deployed')
  }

  return domainGp(chainId, settlementContract) // TODO: Fix types in NPM package
}

async function _signOrder(params: SignOrderParams): Promise<Signature> {
  const { chainId, signer, order, signingScheme } = params

  const domain = _getDomain(chainId)
  console.log('[utils:signature] signOrder', {
    domain,
    order,
    signer
  })

  return signOrderGp(domain, order, signer, getSigningSchemeLibValue(signingScheme))
}

export async function signOrder(
  unsignedOrder: UnsignedOrder,
  chainId: ChainId,
  signer: Signer,
  signingMethod: 'v4' | 'v3' | 'eth_sign' = 'v4'
): Promise<{ signature: string; signingScheme: EcdsaSigningScheme }> {
  const signingScheme = signingMethod === 'eth_sign' ? SigningScheme.ETHSIGN : SigningScheme.EIP712
  let signature: Signature | null = null

  let _signer = signer
  try {
    _signer = signingMethod === 'v3' ? new TypedDataV3Signer(signer) : signer
  } catch (e) {
    console.error('Wallet not supported:', e)
    throw new Error('Wallet not supported')
  }

  const signatureParams: SignOrderParams = {
    chainId,
    signer: _signer,
    order: unsignedOrder,
    signingScheme
  }

  try {
    signature = (await _signOrder(signatureParams)) as EcdsaSignature // Only ECDSA signing supported for now
  } catch (e) {
    if (e.code === METHOD_NOT_FOUND_ERROR_CODE || RPC_REQUEST_FAILED_REGEX.test(e.message)) {
      // Maybe the wallet returns the proper error code? We can only hope 🤞
      // OR it failed with a generic message, there's no error code set, and we also hope it'll work
      // with other methods...
      switch (signingMethod) {
        case 'v4':
          return signOrder(unsignedOrder, chainId, signer, 'v3')
        case 'v3':
          return signOrder(unsignedOrder, chainId, signer, 'eth_sign')
        default:
          throw e
      }
    } else if (e.code === METAMASK_SIGNATURE_ERROR_CODE) {
      // We tried to sign order the nice way.
      // That works fine for regular MM addresses. Does not work for Hardware wallets, though.
      // See https://github.com/MetaMask/metamask-extension/issues/10240#issuecomment-810552020
      // So, when that specific error occurs, we know this is a problem with MM + HW.
      // Then, we fallback to ETHSIGN.
      return signOrder(unsignedOrder, chainId, signer, 'eth_sign')
    } else if (V4_ERROR_MSG_REGEX.test(e.message)) {
      // Failed with `v4`, and the wallet does not set the proper error code
      return signOrder(unsignedOrder, chainId, signer, 'v3')
    } else if (V3_ERROR_MSG_REGEX.test(e.message)) {
      // Failed with `v3`, and the wallet does not set the proper error code
      return signOrder(unsignedOrder, chainId, signer, 'eth_sign')
    } else {
      // Some other error signing. Let it bubble up.
      console.error(e)
      throw e
    }
  }
  return { signature: signature.data.toString(), signingScheme }
}

registerOnWindow({ signature: { signOrder: _signOrder, getDomain: _getDomain } })
