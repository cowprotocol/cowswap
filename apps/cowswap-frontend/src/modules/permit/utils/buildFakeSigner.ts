import { Wallet } from '@ethersproject/wallet'

/**
 * Builds a fake EthersJS Wallet signer to use with EIP2612 Permit
 */
export function buildFakeSigner(): Wallet {
  return Wallet.createRandom()
}
