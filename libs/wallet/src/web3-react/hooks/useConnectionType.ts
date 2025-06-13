import { useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'

import { getWeb3ReactConnection } from '../utils/getWeb3ReactConnection'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useConnectionType() {
  const { connector } = useWeb3React()

  return useMemo(() => getWeb3ReactConnection(connector).type, [connector])
}
