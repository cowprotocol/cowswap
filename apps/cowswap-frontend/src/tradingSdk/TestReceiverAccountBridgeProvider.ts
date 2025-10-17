import { ChainInfo, EvmCall, TokenInfo } from '@cowprotocol/cow-sdk'
import {
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatus,
  BridgeStatusResult,
  BridgingDepositParams,
  BuyTokensParams,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
  ReceiverAccountBridgeProvider,
} from '@cowprotocol/sdk-bridging'

import { getOrder } from 'api/cowProtocol'

/**
 * Tes provider for testing the ReceiverAccountBridgeProvider using an account provided in the constructor.
 * It also relies on a bridge provider that will be used to get the quote, tokens, etc. (to implement this mock easily based on other working providers)
 */
export class TestReceiverAccountBridgeProvider implements ReceiverAccountBridgeProvider<BridgeQuoteResult> {
  type = 'ReceiverAccountBridgeProvider' as const
  info: BridgeProviderInfo

  constructor(
    protected receiver: string,
    protected bridgeProvider: BridgeProvider<BridgeQuoteResult>,
  ) {
    this.info = {
      name: 'Test Receiver Account Bridge',
      logoUrl: bridgeProvider.info.logoUrl,
      dappId: 'test-receiver-bridge',
      website: 'https://github.com/cowprotocol/cowswap',
    }
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return this.bridgeProvider.getNetworks()
  }

  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    return this.bridgeProvider.getBuyTokens(params)
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<TokenInfo[]> {
    return this.bridgeProvider.getIntermediateTokens(request)
  }

  async getQuote(request: QuoteBridgeRequest): Promise<BridgeQuoteResult> {
    return this.bridgeProvider.getQuote(request)
  }

  async getBridgeReceiverOverride(): Promise<string> {
    return this.receiver
  }

  async getBridgingParams(
    chainId: number,
    orderUid: string,
    txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    console.log('getBridgingParams', chainId, orderUid, txHash)

    const order = await getOrder(chainId, orderUid)

    if (!order) {
      return null
    }

    const appData = order.fullAppData ? JSON.parse(order.fullAppData) : null
    const destinationChainId = appData?.metadata?.bridgeInfo?.destinationChainId || 0

    return {
      params: {
        bridgingId: txHash,
        sourceChainId: chainId,
        inputTokenAddress: order.sellToken,
        outputTokenAddress: order.buyToken,
        inputAmount: BigInt(order.sellAmount.toString()),
        outputAmount: BigInt(order.buyAmount.toString()),
        owner: order.owner,
        destinationChainId,
        quoteTimestamp: null,
        fillDeadline: null,
        recipient: order.owner,
      },
      status: {
        status: BridgeStatus.EXECUTED,
        fillTimeInSeconds: 0,
        fillTxHash: txHash,
      },
    }
  }

  getExplorerUrl(bridgingId: string): string {
    return this.bridgeProvider.getExplorerUrl(bridgingId)
  }

  async getStatus(bridgingId: string, originChainId: number): Promise<BridgeStatusResult> {
    return this.bridgeProvider.getStatus(bridgingId, originChainId)
  }

  async getCancelBridgingTx(bridgingId: string): Promise<EvmCall> {
    return this.bridgeProvider.getCancelBridgingTx(bridgingId)
  }

  async getRefundBridgingTx(bridgingId: string): Promise<EvmCall> {
    return this.bridgeProvider.getRefundBridgingTx(bridgingId)
  }
}
