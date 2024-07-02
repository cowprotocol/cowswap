import { useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'

import { getWeb3ReactConnection } from '../utils/getWeb3ReactConnection'

export function useConnectionType() {
  const { connector } = useWeb3React()

  return useMemo(() => getWeb3ReactConnection(connector).type, [connector])
}
