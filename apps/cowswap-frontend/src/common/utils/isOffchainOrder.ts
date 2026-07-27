import { SigningScheme } from '@cowprotocol/cow-sdk'

interface OrderWithSigningScheme {
  signingScheme: SigningScheme
}

export function isOffchainOrder(order: OrderWithSigningScheme): boolean {
  return order.signingScheme === SigningScheme.EIP712
}
