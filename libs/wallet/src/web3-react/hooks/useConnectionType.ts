import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { getWeb3ReactConnection } from '@cowprotocol/wallet'

export function useConnectionType() {
  const { connector } = useWeb3React()

  return useMemo(() => getWeb3ReactConnection(connector).type, [connector])
}
