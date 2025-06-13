import { useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { ConnectionType } from '../../../api/types'
import { getIsInjected } from '../../../api/utils/connection'
import { getWeb3ReactConnection } from '../../utils/getWeb3ReactConnection'

const isIframe = window.top !== window.self

/**
 * `web3-react` library gives us concept of "connectors" which are react-wrappers on top of eip1193 providers.
 * `Web3ReactProvider` has a context which stores state of all active connectors.
 * It is very important! There might be more than one active connector!
 * Because of that, we need to prioritize them on this hook.
 * `web3-react` will take the first active connector from the list and use it.
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOrderedConnections(selectedWallet: ConnectionType | undefined) {
  return useMemo(() => {
    const orderedConnectionTypes: ConnectionType[] = []

    if (isInjectedWidget()) {
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

    if (getIsInjected() && !orderedConnectionTypes.includes(ConnectionType.INJECTED)) {
      orderedConnectionTypes.push(ConnectionType.INJECTED)
    }

    // Add network connection last as it should be the fallback.
    orderedConnectionTypes.push(ConnectionType.NETWORK)

    return orderedConnectionTypes.map(getWeb3ReactConnection)
  }, [selectedWallet])
}
