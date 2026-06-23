import { isInjectedWidget } from '@cowprotocol/common-utils'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { injected, safe } from '@wagmi/connectors'
import { EIP1193Provider } from 'viem'

import { getInjectedProvider } from '../api/utils/connection'
import { COW_WIDGET_CONNECTOR_ID } from '../reown/consts'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'

import type { CreateConnectorFn } from 'wagmi'

function getBrowserInjectedConnector(): CreateConnectorFn {
  return injected({
    target: {
      id: 'injected',
      name: 'Injected',
      provider: getInjectedProvider,
    },
    shimDisconnect: true,
  })
}

export function getConnectors(): CreateConnectorFn[] | undefined {
  const isSafeApp = getIsSafeAppIframe()
  const isWidget = isInjectedWidget()
  const connectors: CreateConnectorFn[] = []

  if (!isSafeApp && !isWidget) {
    connectors.push(getBrowserInjectedConnector())
  }

  if (isSafeApp) {
    connectors.push(safe({ unstable_getInfoTimeout: 1000 }))
  }

  if (isWidget) {
    connectors.push(
      injected({
        target: {
          name: 'CoW Widget',
          id: COW_WIDGET_CONNECTOR_ID,
          provider: new WidgetEthereumProvider() as EIP1193Provider,
        },
        shimDisconnect: false,
      }),
    )
  }

  return connectors.length === 0 ? undefined : connectors
}
