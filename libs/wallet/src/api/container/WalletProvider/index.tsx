import { ReactNode, useEffect } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'

import { reownAppKit } from '../../../reown/init'

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps): ReactNode {
  const theme = useTheme() as { darkMode?: boolean }
  const darkMode = theme?.darkMode ?? false

  useEffect(() => {
    reownAppKit.setThemeMode(darkMode ? 'dark' : 'light')
  }, [darkMode])

  return <>{children}</>
}
