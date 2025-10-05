import { checkIsCallDataAValidPermit, getPermitUtilsInstance, PermitInfo, PermitType } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Interface } from '@ethersproject/abi'
import { JsonRpcProvider } from '@ethersproject/providers'

import { DAI_PERMIT_SELECTOR, EIP_2612_PERMIT_SELECTOR } from '@1inch/permit-signed-approvals-utils'
import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { Order } from 'legacy/state/orders/actions'

import { MAX_APPROVE_AMOUNT } from 'modules/erc20Approve/constants'
import { usePermitInfo } from 'modules/permit'
import { TradeType } from 'modules/trade'

import { isPending } from 'common/hooks/useCategorizeRecentActivity'
import { getOrderPermitIfExists } from 'common/utils/doesOrderHavePermit'

const EIP_2612_SIGNATURE =
  'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)'
const DAI_SIGNATURE =
  'function permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)'

const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: ms`30s`,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryInterval: 0,
}

export function useDoesOrderHaveValidPermit(order?: Order, tradeType?: TradeType): boolean | undefined {
  const { chainId, account } = useWalletInfo()
  const provider = useWalletProvider()
  const permit = order ? getOrderPermitIfExists(order) : null
  const tokenPermitInfo = usePermitInfo(order?.inputToken, tradeType)

  const isPendingOrder = order ? isPending(order) : false
  const checkPermit = account && provider && permit && isPendingOrder && tradeType

  const { data: isValid } = useSWR(
    checkPermit ? [account, chainId, order?.id, tradeType, permit] : null,
    async ([account, chainId]) => {
      if (!permit || !order || !account || !provider || !chainId || !tokenPermitInfo) {
        return undefined
      }

      try {
        return await checkPermitNonceAndAmount(account, chainId, provider, order, permit, tokenPermitInfo)
      } catch (error) {
        console.error('Error validating permit:', error)
        return undefined
      }
    },
    SWR_CONFIG,
  )

  return isValid
}

async function checkPermitNonceAndAmount(
  account: string,
  chainId: number,
  provider: JsonRpcProvider,
  order: Order,
  permitCallData: string,
  permitInfo: PermitInfo,
): Promise<boolean | undefined> {
  try {
    const eip2612Utils = getPermitUtilsInstance(chainId, provider, account)
    const sellTokenAddress = order.sellToken

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

function extractPermitData(callData: string): {
  permitNonce: bigint | null
  permitAmount: bigint | null
  permitType: PermitType
} {
  try {
    if (callData.startsWith(EIP_2612_PERMIT_SELECTOR)) {
      const erc20Interface = new Interface([EIP_2612_SIGNATURE])

      const decoded = erc20Interface.decodeFunctionData('permit', callData)
      return {
        permitNonce: null, // EIP-2612 doesn't have nonce in call data, it's in the signature
        permitAmount: decoded.value ? BigInt(decoded.value.toString()) : null,
        permitType: 'eip-2612',
      }
    }

    if (callData.startsWith(DAI_PERMIT_SELECTOR)) {
      const daiInterface = new Interface([DAI_SIGNATURE])

      const decoded = daiInterface.decodeFunctionData('permit', callData)
      return {
        permitNonce: decoded.nonce ? BigInt(decoded.nonce.toString()) : null,
        permitAmount: decoded.allowed ? MAX_APPROVE_AMOUNT : 0n,
        permitType: 'dai-like',
      }
    }

    return { permitNonce: null, permitAmount: null, permitType: 'unsupported' }
  } catch (error) {
    console.error('Error extracting permit data:', error)
    return { permitNonce: null, permitAmount: null, permitType: 'unsupported' }
  }
}
