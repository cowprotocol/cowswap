import { checkIsCallDataAValidPermit, getPermitUtilsInstance, PermitInfo } from '@cowprotocol/permit-utils'
import { JsonRpcProvider } from '@ethersproject/providers'

import { GenericOrder } from 'common/types'

import { extractPermitData } from './extractPermitData'

export async function checkPermitNonceAndAmount(
  account: string,
  chainId: number,
  provider: JsonRpcProvider,
  order: GenericOrder,
  permitCallData: string,
  permitInfo: PermitInfo,
): Promise<boolean | undefined> {
  try {
    const eip2612Utils = await getPermitUtilsInstance(chainId, provider, account)
    const sellTokenAddress = order.inputToken.address

    const { permitNonce, permitAmount, permitType } = extractPermitData(permitCallData)

    if (permitType === 'dai-like' && permitNonce !== null) {
      // For DAI permits, compare nonces directly
      const currentNonceAsNumber = await eip2612Utils.getTokenNonce(sellTokenAddress, account)
      const currentNonce = BigInt(currentNonceAsNumber)
      const isNonceValid = currentNonce <= permitNonce

      if (!isNonceValid) return false
    } else if (permitType === 'eip-2612') {
      // For EIP-2612 doesn't have nonce in call data, validate the entire permit
      try {
        const tokenName = order.inputToken.name
        const isPermitValid = await checkIsCallDataAValidPermit(
          account,
          chainId,
          eip2612Utils,
          sellTokenAddress,
          tokenName,
          permitCallData,
          permitInfo,
        )

        if (!isPermitValid) return false
      } catch (error) {
        console.error('Error validating EIP-2612 permit:', error)
        return false
      }
    }

    if (permitAmount === null) {
      return undefined
    }

    const orderSellAmount = BigInt(order.sellAmount)
    return permitAmount >= orderSellAmount
  } catch (error) {
    console.error('Error checking permit nonce and amount:', error)
    return false
  }
}
