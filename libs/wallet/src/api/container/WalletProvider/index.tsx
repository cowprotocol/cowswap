import { ReactNode, useEffect } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'

import { reownAppKit } from '../../../reown/init'

export function WalletProvider({ children }: { children: ReactNode }) {
  const { darkMode } = useTheme()

  useEffect(() => {
    // TODO: configure setThemeVariables()
    reownAppKit.setThemeMode(darkMode ? 'dark' : 'light')
  }, [darkMode])

  return children
}
