import { useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { BACKFILLABLE_WALLETS, ConnectionType } from '../../../api/types'
import { getWeb3ReactConnection } from '../../utils/getWeb3ReactConnection'

const SELECTABLE_WALLETS = [...BACKFILLABLE_WALLETS]

// TODO: The logic looks very similar with useEagerlyConnect
export function useOrderedConnections(selectedWallet: ConnectionType | undefined) {
  return useMemo(() => {
    const orderedConnectionTypes: ConnectionType[] = []

    if (isInjectedWidget()) {
      orderedConnectionTypes.push(ConnectionType.INJECTED)
    }

    // Always attempt to use to Gnosis Safe first, as we can't know if we're in a SafeContext.
    orderedConnectionTypes.push(ConnectionType.GNOSIS_SAFE)

    // Add the `selectedWallet` to the top so it's prioritized, then add the other selectable wallets.
    if (selectedWallet) {
      orderedConnectionTypes.push(selectedWallet)
    }
    orderedConnectionTypes.push(...SELECTABLE_WALLETS.filter((wallet) => wallet !== selectedWallet))

    // Add network connection last as it should be the fallback.
    orderedConnectionTypes.push(ConnectionType.NETWORK)

    return orderedConnectionTypes.map(getWeb3ReactConnection)
  }, [selectedWallet])
}
