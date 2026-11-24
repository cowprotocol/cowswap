import { logWallet, normalizeError } from '@cowprotocol/common-utils'

import { ConstantsUtil } from '@reown/appkit-common'
import { ConnectionController, ConnectorController } from '@reown/appkit-controllers'

import { WIDGET_SOLANA_WALLET_NAME } from './WidgetSolanaStandardWallet'

/**
 * Connects the widget to the host dapp's Solana wallet.
 *
 * Dapp mode hides the widget's own connect button, so nothing would ever pick this connector —
 * the EVM side solves that the same way, with `connectWalletById(COW_WIDGET_CONNECTOR_ID)`.
 *
 * The connector only exists once Reown's `watchStandard()` has seen the registration, which is a
 * tick or two after `registerWidgetSolanaWallet()`, so a missing connector means "not yet" and we
 * wait for the next connector-list change.
 *
 * @returns A cleanup that stops waiting for the connector to appear.
 */
export function connectWidgetSolanaWallet(): () => void {
  let unsubscribe: (() => void) | null = null
  let stopped = false

  const stop = (): void => {
    stopped = true
    unsubscribe?.()
    unsubscribe = null
  }

  const tryConnect = (): boolean => {
    const connector = ConnectorController.getConnectorsByNamespace(ConstantsUtil.CHAIN.SOLANA).find(
      (candidate) => candidate.name === WIDGET_SOLANA_WALLET_NAME,
    )

    if (!connector) return false

    ConnectionController.connectExternal(
      { id: connector.id, type: connector.type, provider: connector.provider },
      ConstantsUtil.CHAIN.SOLANA,
      // Leave the active chain alone: the widget may well be showing an EVM pair.
      false,
    ).catch((err: unknown) => {
      logWallet.error(new Error('Failed to connect the host Solana wallet', { cause: normalizeError(err) }))
    })

    return true
  }

  if (tryConnect()) return () => void 0

  unsubscribe = ConnectorController.subscribe(() => {
    if (stopped) return

    if (tryConnect()) stop()
  })

  return stop
}
