import { useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { ConnectionType } from '../../../api/types'
import { getIsInjected } from '../../../api/utils/connection'
import { getWeb3ReactConnection } from '../../utils/getWeb3ReactConnection'

const isIframe = window.top !== window.self

export function useOrderedConnections(selectedWallet: ConnectionType | undefined) {
  return useMemo(() => {
    const orderedConnectionTypes: ConnectionType[] = []

    if (isInjectedWidget() || getIsInjected()) {
      orderedConnectionTypes.push(ConnectionType.INJECTED)
    }

    // Always attempt to use to Gnosis Safe first in iframe, as we can't know if we're in a SafeContext.
    if (isIframe) {
      orderedConnectionTypes.push(ConnectionType.GNOSIS_SAFE)
    }

    // Add the `selectedWallet` to the top so it's prioritized, then add the other selectable wallets.
    if (selectedWallet && !orderedConnectionTypes.includes(selectedWallet)) {
      orderedConnectionTypes.push(selectedWallet)
    }

    // Add network connection last as it should be the fallback.
    orderedConnectionTypes.push(ConnectionType.NETWORK)

    return orderedConnectionTypes.map(getWeb3ReactConnection)
  }, [selectedWallet])
}
