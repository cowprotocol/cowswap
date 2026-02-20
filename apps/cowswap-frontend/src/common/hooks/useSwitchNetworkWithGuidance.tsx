import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { isMobile, withTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddSnackbar, useRemoveSnackbar } from '@cowprotocol/snackbars'
import { ConnectionType, useConnectionType, useSwitchNetwork, useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { sendCoinbaseConnectionFlowEvent } from '../analytics/coinbaseConnectionFlow'

const COINBASE_MOBILE_SWITCH_SNACKBAR_ID = 'coinbase-mobile-network-switch'
const COINBASE_MOBILE_SWITCH_TIMEOUT_MS = 60_000

// Module-scoped: shared across ALL hook instances (useOnSelectNetwork + useSetupTradeState)
let inFlightPromise: Promise<void> | null = null

export interface SwitchNetworkWithGuidanceMeta {
  source: 'networkSelector' | 'tradeStateSync'
}

type SwitchNetworkTelemetryEvent = {
  stage: 'switchStart' | 'switchSuccess' | 'switchError' | 'switchBlockedInFlight'
  result: 'started' | 'success' | 'error' | 'blocked'
  source: SwitchNetworkWithGuidanceMeta['source']
  targetChain: SupportedChainId
  error?: unknown
}

interface SwitchExecutionParams {
  addSnackbar: ReturnType<typeof useAddSnackbar>
  chainId: SupportedChainId
  cowAnalytics: ReturnType<typeof useCowAnalytics>
  isCoinbaseWallet: boolean
  removeSnackbar: ReturnType<typeof useRemoveSnackbar>
  source: SwitchNetworkWithGuidanceMeta['source']
  switchNetwork: ReturnType<typeof useSwitchNetwork>
  targetChain: SupportedChainId
}

interface SwitchRequestParams {
  addSnackbar: ReturnType<typeof useAddSnackbar>
  isCoinbaseMobile: boolean
  switchNetwork: ReturnType<typeof useSwitchNetwork>
  targetChain: SupportedChainId
}

/** Exported for test cleanup only */
export function _resetInFlightState(): void {
  inFlightPromise = null
}

export class SwitchInProgressError extends Error {
  constructor() {
    super('Network switch already in progress')
    this.name = 'SwitchInProgressError'
  }
}

function sendSwitchTelemetryEvent(
  event: SwitchNetworkTelemetryEvent,
  chainId: SupportedChainId,
  cowAnalytics: ReturnType<typeof useCowAnalytics>,
  isCoinbaseWallet: boolean,
): void {
  if (!isCoinbaseWallet) {
    return
  }

  sendCoinbaseConnectionFlowEvent(cowAnalytics, {
    stage: event.stage,
    result: event.result,
    source: event.source,
    chainId,
    targetChainId: event.targetChain,
    isMobile,
    isCoinbaseWallet,
    error: event.error,
  })
}

async function performSwitchRequest({
  addSnackbar,
  isCoinbaseMobile,
  switchNetwork,
  targetChain,
}: SwitchRequestParams): Promise<void> {
  if (isCoinbaseMobile) {
    addSnackbar({
      id: COINBASE_MOBILE_SWITCH_SNACKBAR_ID,
      icon: 'alert',
      content: <Trans>Please open the Coinbase Wallet app to complete the network switch.</Trans>,
      duration: COINBASE_MOBILE_SWITCH_TIMEOUT_MS + 5_000,
    })

    const promise = withTimeout(switchNetwork(targetChain), COINBASE_MOBILE_SWITCH_TIMEOUT_MS, 'Network switch')
    inFlightPromise = promise
    await promise
    return
  }

  await switchNetwork(targetChain)
}

async function executeSwitchNetworkWithGuidance({
  addSnackbar,
  chainId,
  cowAnalytics,
  isCoinbaseWallet,
  removeSnackbar,
  source,
  switchNetwork,
  targetChain,
}: SwitchExecutionParams): Promise<void> {
  const isCoinbaseMobile = isMobile && isCoinbaseWallet

  if (isCoinbaseMobile && inFlightPromise) {
    sendSwitchTelemetryEvent(
      {
        stage: 'switchBlockedInFlight',
        result: 'blocked',
        source,
        targetChain,
      },
      chainId,
      cowAnalytics,
      isCoinbaseWallet,
    )
    throw new SwitchInProgressError()
  }

  sendSwitchTelemetryEvent(
    {
      stage: 'switchStart',
      result: 'started',
      source,
      targetChain,
    },
    chainId,
    cowAnalytics,
    isCoinbaseWallet,
  )

  try {
    await performSwitchRequest({
      addSnackbar,
      isCoinbaseMobile,
      switchNetwork,
      targetChain,
    })

    sendSwitchTelemetryEvent(
      {
        stage: 'switchSuccess',
        result: 'success',
        source,
        targetChain,
      },
      chainId,
      cowAnalytics,
      isCoinbaseWallet,
    )
  } catch (error) {
    sendSwitchTelemetryEvent(
      {
        stage: error instanceof SwitchInProgressError ? 'switchBlockedInFlight' : 'switchError',
        result: error instanceof SwitchInProgressError ? 'blocked' : 'error',
        source,
        targetChain,
        error,
      },
      chainId,
      cowAnalytics,
      isCoinbaseWallet,
    )

    throw error
  } finally {
    if (isCoinbaseMobile) {
      removeSnackbar(COINBASE_MOBILE_SWITCH_SNACKBAR_ID)
      inFlightPromise = null
    }
  }
}

export function useSwitchNetworkWithGuidance(): (
  targetChain: SupportedChainId,
  meta?: SwitchNetworkWithGuidanceMeta,
) => Promise<void> {
  const cowAnalytics = useCowAnalytics()
  const switchNetwork = useSwitchNetwork()
  const connectionType = useConnectionType()
  const isCoinbaseWallet = connectionType === ConnectionType.COINBASE_WALLET
  const { chainId } = useWalletInfo()
  const addSnackbar = useAddSnackbar()
  const removeSnackbar = useRemoveSnackbar()

  return useCallback(
    async (targetChain: SupportedChainId, meta?: SwitchNetworkWithGuidanceMeta) => {
      const source = meta?.source ?? 'networkSelector'

      await executeSwitchNetworkWithGuidance({
        addSnackbar,
        chainId,
        cowAnalytics,
        isCoinbaseWallet,
        removeSnackbar,
        source,
        switchNetwork,
        targetChain,
      })
    },
    [cowAnalytics, switchNetwork, isCoinbaseWallet, chainId, addSnackbar, removeSnackbar],
  )
}
