import { useEffect } from 'react'

import { useSetBalancesContext } from 'entities/balancesContext/useBalancesContext'

export function useSetupBalancesContext(proxyAddress: string | undefined): void {
  const setBalancesContext = useSetBalancesContext()

  useEffect(() => {
    if (proxyAddress) {
      setBalancesContext({ account: proxyAddress })
    }

    return () => {
      setBalancesContext({ account: null })
    }
  }, [proxyAddress, setBalancesContext])
}
