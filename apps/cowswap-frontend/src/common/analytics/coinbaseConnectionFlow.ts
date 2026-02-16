import type { CowAnalytics } from '@cowprotocol/analytics'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const COINBASE_CONNECTION_FLOW_EVENT = 'coinbase_connection_flow'
const COINBASE_CONNECTION_FLOW_VERSION = 'v1'

export type CoinbaseConnectionFlowStage =
  | 'connectStart'
  | 'connectSuccess'
  | 'connectError'
  | 'switchStart'
  | 'switchSuccess'
  | 'switchError'
  | 'switchBlockedInFlight'

export type CoinbaseConnectionFlowResult = 'started' | 'success' | 'error' | 'blocked'

export type CoinbaseConnectionFlowSource = 'walletModal' | 'networkSelector' | 'tradeStateSync'

interface CoinbaseConnectionFlowEventParams {
  stage: CoinbaseConnectionFlowStage
  result: CoinbaseConnectionFlowResult
  source: CoinbaseConnectionFlowSource
  chainId?: SupportedChainId
  targetChainId?: SupportedChainId
  isMobile: boolean
  isCoinbaseWallet: boolean
  error?: unknown
}

interface CoinbaseConnectionFlowEventPayload {
  flowVersion: string
  stage: CoinbaseConnectionFlowStage
  result: CoinbaseConnectionFlowResult
  source: CoinbaseConnectionFlowSource
  chainId?: SupportedChainId
  targetChainId?: SupportedChainId
  isMobile: boolean
  isCoinbaseWallet: boolean
  errorName?: string
  errorMessage?: string
}

function getErrorDetails(error: unknown): Pick<CoinbaseConnectionFlowEventPayload, 'errorName' | 'errorMessage'> {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
    }
  }

  if (typeof error === 'string') {
    return {
      errorName: 'Error',
      errorMessage: error,
    }
  }

  return {}
}

export function sendCoinbaseConnectionFlowEvent(
  cowAnalytics: CowAnalytics,
  params: CoinbaseConnectionFlowEventParams,
): void {
  const payload: CoinbaseConnectionFlowEventPayload = {
    flowVersion: COINBASE_CONNECTION_FLOW_VERSION,
    stage: params.stage,
    result: params.result,
    source: params.source,
    chainId: params.chainId,
    targetChainId: params.targetChainId,
    isMobile: params.isMobile,
    isCoinbaseWallet: params.isCoinbaseWallet,
    ...getErrorDetails(params.error),
  }

  cowAnalytics.sendEvent(COINBASE_CONNECTION_FLOW_EVENT, payload)
}
