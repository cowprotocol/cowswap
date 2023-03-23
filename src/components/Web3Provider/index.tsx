import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { Web3ReactConnection } from '@cow/modules/wallet/web3-react/types'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'
import { useOrderedConnections, useEagerlyConnect } from '@cow/modules/wallet'
import { ReactNode, useMemo } from 'react'

export default function Web3Provider({ children }: { children: ReactNode }) {
  useEagerlyConnect()
  const connections = useOrderedConnections()
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [connector, hooks])

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
