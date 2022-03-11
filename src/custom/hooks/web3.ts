// import { EthereumProvider } from '@src/lib/ethereum'
import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from 'web3-react-core'

import { injected, gnosisSafe, walletconnect, getProviderType, WalletProvider, fortmatic, walletlink } from 'connectors'
import { IS_IN_IFRAME } from 'constants/misc'
import { isMobile } from 'utils/userAgent'

// MOD imports
import { STORAGE_KEY_LAST_PROVIDER, WAITING_TIME_RECONNECT_LAST_PROVIDER } from 'constants/index'
import { AbstractConnector } from '@web3-react/abstract-connector'

// exports from the original file
export { useInactiveListener } from '@src/hooks/web3'
export { default as useActiveWeb3React } from 'hooks/useActiveWeb3React'

enum DefaultProvidersInjected {
  METAMASK = WalletProvider.INJECTED,
  COINBASE_WALLET = WalletProvider.WALLET_LINK,
}

// TODO: original from uniswap has gnosis-safe connection details, could be re-used
export function useEagerConnect() {
  const { activate, active, connector } = useWeb3React()
  const [tried, setTried] = useState(false)

  // gnosisSafe.isSafeApp() races a timeout against postMessage, so it delays pageload if we are not in a safe app;
  // if we are not embedded in an iframe, it is not worth checking
  const [triedSafe, setTriedSafe] = useState(!IS_IN_IFRAME)

  // handle setting/removing wallet provider in local storage
  const handleBeforeUnload = useCallback(() => {
    const walletType = getProviderType(connector)

    if (!walletType || !active) {
      localStorage.removeItem(STORAGE_KEY_LAST_PROVIDER)
    } else {
      localStorage.setItem(STORAGE_KEY_LAST_PROVIDER, walletType)
    }
  }, [connector, active])

  const connectInjected = useCallback(
    (providerName = DefaultProvidersInjected.METAMASK) => {
      // check if the our application is authorized/connected with Metamask
      injected.isAuthorized().then((isAuthorized) => {
        if (isAuthorized) {
          setDefaultInjected(providerName)
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          if (isMobile && window.ethereum) {
            setDefaultInjected(providerName)
            activate(injected, undefined, true).catch(() => {
              setTried(true)
            })
          } else {
            setTried(true)
          }
        }
      })
    },
    [activate, setTried]
  )

  const reconnectUninjectedProvider = useCallback(
    (provider: AbstractConnector): void => {
      activate(provider, undefined, true).catch(() => {
        setTried(true)
      })
    },
    [activate]
  )

  const connectSafe = useCallback(() => {
    gnosisSafe.isSafeApp().then((loadedInSafe) => {
      if (loadedInSafe) {
        activate(gnosisSafe, undefined, true).catch(() => {
          setTriedSafe(true)
        })
      } else {
        setTriedSafe(true)
      }
    })
  }, [activate, setTriedSafe])

  useEffect(() => {
    if (!active) {
      const latestProvider = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)

      // if there is no last saved provider set tried state to true
      if (!latestProvider) {
        if (!triedSafe) {
          // First try to connect using Gnosis Safe
          connectSafe()
        } else {
          // Then try to connect using the injected wallet
          connectInjected()
        }
      } else if (latestProvider === WalletProvider.GNOSIS_SAFE) {
        connectSafe()
      } else if (latestProvider === WalletProvider.INJECTED) {
        // MM is last provider
        connectInjected()
      } else if (latestProvider === WalletProvider.WALLET_CONNECT) {
        // WC is last provider
        reconnectUninjectedProvider(walletconnect)
      } else if (latestProvider === WalletProvider.WALLET_LINK) {
        reconnectUninjectedProvider(walletlink)
      } else if (latestProvider === WalletProvider.FORMATIC) {
        reconnectUninjectedProvider(fortmatic)
      }
    }
  }, [connectInjected, active, connectSafe, triedSafe, reconnectUninjectedProvider]) // intentionally only running on mount (make sure it's only mounted once :))

  // wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined

    if (active) {
      setTried(true)
    } else {
      timeout = setTimeout(() => {
        localStorage.removeItem(STORAGE_KEY_LAST_PROVIDER)
        setTried(true)
      }, WAITING_TIME_RECONNECT_LAST_PROVIDER)
    }

    return () => timeout && clearTimeout(timeout)
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

/**
 * Allows to select the default injected ethereum provider.
 *
 * It is assumed that metamask is the default injected Provider, however coinbaseWallet overrides this.
 */
export function setDefaultInjected(providerName: DefaultProvidersInjected) {
  const { ethereum } = window

  if (!ethereum?.providers) return

  let provider
  switch (providerName) {
    case DefaultProvidersInjected.COINBASE_WALLET:
      provider = ethereum.providers.find(({ isCoinbaseWallet }) => isCoinbaseWallet)
      break
    case DefaultProvidersInjected.METAMASK:
      provider = ethereum.providers.find(({ isMetaMask }) => isMetaMask)
      break
  }

  if (provider) {
    ethereum.setSelectedProvider(provider)
  }
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
