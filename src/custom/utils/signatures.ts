import { domain as domainGp, signOrder as signOrderGp, Order } from '@gnosis.pm/gp-v2-contracts'
import { ChainId } from '@uniswap/sdk'

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from 'constants/index'
import { TypedDataDomain, Signer } from 'ethers'

export { OrderKind } from '@gnosis.pm/gp-v2-contracts'
export type UnsignedOrder = Order

export interface SignOrderParams {
  chainId: ChainId
  signer: Signer
  order: UnsignedOrder
}

// TODO: We cannot make use of the NPM exported enum, see https://babeljs.io/docs/en/babel-plugin-transform-typescript#caveats
//      use workaround?
// /**
//  * The signing scheme used to sign the order.
//  */
// export declare const enum SigningScheme {
//   /**
//    * The EIP-712 typed data signing scheme. This is the preferred scheme as it
//    * provides more infomation to wallets performing the signature on the data
//    * being signed.
//    *
//    * <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-domainseparator>
//    */
//   TYPED_DATA = 0,
//   /**
//    * The generic message signing scheme.
//    */
//   MESSAGE = 1
// }

// /**
//  * Order kind.
//  */
// export declare const enum OrderKind {
//   /**
//    * A sell order.
//    */
//   SELL = 0,
//   /**
//    * A buy order.
//    */
//   BUY = 1
// }

// TODO: For now, instead of using enums (see todo above)
const TYPED_DATA_SIGNING_SCHEME = 0
export const ORDER_KIND_SELL = 0
export const ORDER_KIND_BUY = 0

function _getDomain(chainId: ChainId): TypedDataDomain {
  // Get settlement contract address
  const settlementContract = GP_SETTLEMENT_CONTRACT_ADDRESS[chainId]

  if (!settlementContract) {
    throw new Error('Unsupported network. Settlement contract is not deployed')
  }

  return domainGp(chainId, settlementContract) // TODO: Fix types in NPM package
}

export async function signOrder(params: SignOrderParams): Promise<string> {
  const { chainId, signer, order } = params

  const domain = _getDomain(chainId)
  console.log('[signature] signOrder', { domain, order, signer, TYPED_DATA_SIGNING_SCHEME })
  return signOrderGp(domain, order, signer, TYPED_DATA_SIGNING_SCHEME)
}
