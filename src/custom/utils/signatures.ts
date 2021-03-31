import { domain as domainGp, signOrder as signOrderGp, Order, Signature } from '@gnosis.pm/gp-v2-contracts'
import { ChainId } from '@uniswap/sdk'

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from 'constants/index'
import { TypedDataDomain, Signer } from 'ethers'
import { registerOnWindow } from './misc'

export { OrderKind } from '@gnosis.pm/gp-v2-contracts'
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

export async function signOrder(params: SignOrderParams): Promise<Signature> {
  const { chainId, signer, order, signingScheme } = params

  const domain = _getDomain(chainId)
  console.log('[utils:signature] signOrder', {
    domain,
    order,
    signer
  })

  return signOrderGp(domain, order, signer, getSigningSchemeLibValue(signingScheme))
}

registerOnWindow({ signature: { signOrder, getDomain: _getDomain } })
