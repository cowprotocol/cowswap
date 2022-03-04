// import { EthereumProvider } from '@src/lib/ethereum'
import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from 'web3-react-core'

import { injected, walletconnect, getProviderType, WalletProvider } from 'connectors'
// import { IS_IN_IFRAME } from '../constants/misc'
// import { isMobile } from '../utils/userAgent'

// MOD imports
import { isMobile } from 'react-device-detect'
import { STORAGE_KEY_LAST_PROVIDER } from 'constants/index'

// exports from the original file
export { useInactiveListener } from '@src/hooks/web3'
export { default as useActiveWeb3React } from 'hooks/useActiveWeb3React'

// TODO: original from uniswap has gnosis-safe connection details, could be re-used
export function useEagerConnect() {
  const { activate, active, connector } = useWeb3React()
  const [tried, setTried] = useState(false)

  // handle setting/removing wallet provider in local storage
  const handleBeforeUnload = useCallback(() => {
    const walletType = getProviderType(connector)

    if (!walletType || !active) {
      localStorage.removeItem(STORAGE_KEY_LAST_PROVIDER)
    } else {
      localStorage.setItem(STORAGE_KEY_LAST_PROVIDER, walletType)
    }
  }, [connector, active])

  const connectInjected = useCallback(() => {
    // check if the our application is authorized/connected with Metamask
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate, setTried])

  const connectWalletConnect = useCallback(() => {
    activate(walletconnect, undefined, true).catch(() => {
      setTried(true)
    })
  }, [activate, setTried])

  useEffect(() => {
    if (!active) {
      const latestProvider = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)

      // if there is no last saved provider set tried state to true
      if (!latestProvider) {
        // Try to auto-connect to the injected wallet
        connectInjected()
      } else if (latestProvider === WalletProvider.INJECTED) {
        // MM is last provider
        connectInjected()
      } else if (latestProvider === WalletProvider.WALLET_CONNECT) {
        // WC is last provider
        connectWalletConnect()
      }
    }
  }, [connectInjected, connectWalletConnect, active]) // intentionally only running on mount (make sure it's only mounted once :))

  // wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  useEffect(() => {
    // add beforeunload event listener on initial component mount
    window.addEventListener('beforeunload', handleBeforeUnload)

    // remove beforeunload event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  })

  return tried
}

// TODO: new funciton, checker whether we can use it
/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
/* export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React()

  useEffect(() => {
    const ethereum = window.ethereum as EthereumProvider | undefined

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch((error) => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch((error) => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
} */
