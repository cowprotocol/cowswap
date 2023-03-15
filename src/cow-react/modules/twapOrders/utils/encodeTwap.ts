// eslint-disable-next-line no-restricted-imports
import { ethers, providers, utils } from 'ethers'
import { CONDITIONAL_ORDER_TYPEHASH, SETTLEMENT, TWAP_ORDER_STRUCT } from '@cow/modules/twapOrders/consts'
import { CoWSettlement__factory } from '@cow/modules/twapOrders/types'

export interface TWAPData {
  sellToken: string
  buyToken: string
  receiver: string
  partSellAmount: string
  minPartLimit: string
  t0: number
  n: number
  t: number
  span: number
}

/**
 *
 * @param data corresponding to the TWAP order
 * @param provider JSON-RPC provider used to get the domain separator
 * @returns An EIP-712 digest and the ABI-encoded TWAP as a payload
 */
export const encodeTwap = async (
  data: TWAPData,
  provider: providers.Provider
): Promise<{ digest: string; payload: string }> => {
  const payload = utils.defaultAbiCoder.encode([TWAP_ORDER_STRUCT], [data])

  const settlementContract = CoWSettlement__factory.connect(SETTLEMENT, provider)
  const domainSeparator = await settlementContract.domainSeparator()

  const structHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(['bytes32', 'bytes32'], [CONDITIONAL_ORDER_TYPEHASH, utils.keccak256(payload)])
  )

  const digest = utils.keccak256(
    ethers.utils.solidityPack(['bytes1', 'bytes1', 'bytes32', 'bytes32'], ['0x19', '0x01', domainSeparator, structHash])
  )

  return { digest, payload }
}
