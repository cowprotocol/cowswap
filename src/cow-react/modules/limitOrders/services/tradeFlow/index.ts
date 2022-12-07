import { PostOrderParams, signAndPostOrder } from 'utils/trade'
import { presignOrderStep } from '@cow/modules/swap/services/swapFlow/steps/presignOrderStep'
import { addPendingOrderStep } from '@cow/modules/swap/services/common/steps/addPendingOrderStep'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AppDispatch } from 'state'
import { GPv2Settlement } from '@cow/abis/types'
import { PriceImpact } from 'hooks/usePriceImpact'
import { LimitOrdersSettingsState } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from '@cow/modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { Web3Provider } from '@ethersproject/providers'
import { AddAppDataToUploadQueueParams, AppDataInfo } from 'state/appData/types'
import confirmPriceImpactWithoutFee from '@src/components/swap/confirmPriceImpactWithoutFee'
import { LOW_RATE_THRESHOLD_PERCENT } from '@cow/modules/limitOrders/const/trade'

export interface TradeFlowContext {
  // signer changes creates redundant re-renders
  // validTo must be calculated just before signing of an order
  postOrderParams: Omit<PostOrderParams, 'validTo' | 'signer'>
  settlementContract: GPv2Settlement
  chainId: SupportedChainId
  dispatch: AppDispatch
  rateImpact: number
  appData: AppDataInfo
  addAppDataToUploadQueue: (update: AddAppDataToUploadQueueParams) => void
  provider: Web3Provider
  allowsOffchainSigning: boolean
  isGnosisSafeWallet: boolean
}

export class PriceImpactDeclineError extends Error {}

export async function tradeFlow(
  params: TradeFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  beforeTrade?: () => void
): Promise<string> {
  // Don't check price impact warning if there is rate impact warning already
  const isTooLowRate = params.rateImpact < LOW_RATE_THRESHOLD_PERCENT

  if (!isTooLowRate && priceImpact.priceImpact && !confirmPriceImpactWithoutFee(priceImpact.priceImpact)) {
    throw new PriceImpactDeclineError()
  }

  beforeTrade?.()

  const validTo = calculateLimitOrdersDeadline(settingsState)

  const { id: orderId, order } = await signAndPostOrder({
    ...params.postOrderParams,
    signer: params.provider.getSigner(),
    validTo,
  })

  const presignTx = await (params.allowsOffchainSigning
    ? Promise.resolve(null)
    : presignOrderStep(orderId, params.settlementContract))

  addPendingOrderStep(
    {
      id: orderId,
      chainId: params.chainId,
      order: {
        ...order,
        presignGnosisSafeTxHash: params.isGnosisSafeWallet && presignTx ? presignTx.hash : undefined,
      },
    },
    params.dispatch
  )

  params.addAppDataToUploadQueue({ chainId: params.chainId, orderId, appData: params.appData })

  return orderId
}
