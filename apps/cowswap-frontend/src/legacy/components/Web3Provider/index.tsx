import { ReactNode, useMemo } from 'react'

import { getConnectionName, Web3ReactConnection } from '@cowprotocol/wallet'
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { useEagerlyConnect } from './hooks/useEagerlyConnect'
import { useOrderedConnections } from './hooks/useOrderedConnections'

export default function Web3Provider({ children }: { children: ReactNode }) {
  useEagerlyConnect()

  const connections = useOrderedConnections()
  const connectors: [Connector, Web3ReactHooks][] = connections
    .filter(Boolean)
    .map(({ hooks, connector }) => [connector, hooks])

  const key = useMemo(
    () => connections.map(({ type }: Web3ReactConnection) => getConnectionName(type)).join('-'),
    [connections]
  )

  return (
    <Web3ReactProvider connectors={connectors} key={key}>
      {children}
    </Web3ReactProvider>
  )
}
