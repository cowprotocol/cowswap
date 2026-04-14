import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Color } from '@cowprotocol/ui'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { safe } from '@wagmi/connectors'
import { http } from 'viem'
import { createStorage, type Transport } from 'wagmi'

import { throttledInjected } from './connectors/throttledInjected'

import { SUPPORTED_REOWN_NETWORKS } from '../reown/consts'

type ConnectorInstance = ReturnType<typeof safe> | ReturnType<typeof throttledInjected>

function isEmbeddedInIframe(): boolean {
  return typeof window !== 'undefined' && window.self !== window.top
}

function getConnectors(): ConnectorInstance[] {
  const injected = throttledInjected()
  if (isEmbeddedInIframe()) {
    return [safe({ shimDisconnect: true }), injected]
  }
  return [injected]
}

const wagmiTransports = SUPPORTED_REOWN_NETWORKS.reduce(
  (acc, chain) => {
    const chainId = chain.id as SupportedChainId
    const url = RPC_URLS[chainId]
    if (url) {
      acc[chainId] = http(url)
    }
    return acc
  },
  {} as Record<SupportedChainId, Transport>,
)

/** CAIP-shaped RPCs for AppKit UI / network metadata (pairs with `wagmiTransports`). */
const customRpcUrls: Record<string, Array<{ url: string }>> = {}
for (const chain of SUPPORTED_REOWN_NETWORKS) {
  const url = RPC_URLS[chain.id as SupportedChainId]
  if (url) {
    customRpcUrls[`eip155:${chain.id}`] = [{ url }]
  }
}

const projectId = 'be9f19dedc14dc05c554d97f92aed71d'

const WAGMI_STORAGE_KEY = 'cowswap-wallet'

const storage =
  typeof window === 'undefined'
    ? createStorage({
        storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      })
    : createStorage({
        storage: window.localStorage,
        key: WAGMI_STORAGE_KEY,
      })

const metadata = {
  name: 'CoW Swap',
  description:
    'CoW Swap finds the lowest prices from all decentralized exchanges and DEX aggregators & saves you more with p2p trading and protection from MEV',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/favicon-light-mode.png'],
}

export const wagmiAdapter = new WagmiAdapter({
  connectors: getConnectors() as ConstructorParameters<typeof WagmiAdapter>[0]['connectors'],
  customRpcUrls,
  networks: SUPPORTED_REOWN_NETWORKS,
  projectId,
  storage,
  transports: wagmiTransports,
})

export const config = wagmiAdapter.wagmiConfig

export const reownAppKit = createAppKit({
  adapters: [wagmiAdapter],
  allowUnsupportedChain: true,
  customRpcUrls,
  defaultNetwork: VIEM_CHAINS[getCurrentChainIdFromUrl()],
  enableEIP6963: true,
  enableReconnect: true,
  enableWalletGuide: false,
  featuredWalletIds: [
    '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  ],
  features: {
    analytics: false,
    email: false,
    socials: false,
    connectorTypeOrder: ['injected', 'recent', 'walletConnect'],
  },
  // Match CoW Swap's ButtonPrimary styling
  themeMode: 'light',
  themeVariables: {
    '--apkt-accent': Color.blue300Primary,
    '--w3m-accent': Color.blue300Primary,
    '--apkt-border-radius-master': '4px',
    '--w3m-border-radius-master': '4px',
    '--apkt-font-family': "'studiofeixen', 'Inter var', 'Inter', Arial, sans-serif",
    '--w3m-font-family': "'studiofeixen', 'Inter var', 'Inter', Arial, sans-serif",
    '--apkt-font-size-master': '11px',
    '--w3m-font-size-master': '11px',
  },
  metadata,
  networks: SUPPORTED_REOWN_NETWORKS,
  projectId,
  termsConditionsUrl:
    'https://cow.fi/legal/cowswap-terms?utm_source=swap.cow.fi&utm_medium=web&utm_content=wallet-modal-terms-link',
})

// TODO: AppKit v1.8.19 has broken theming — themeVariables don't propagate to button backgrounds,
// theme gets overwritten on mount, and "Explore all" is hardcoded with a dead URL.
// These workarounds should be removed once AppKit fixes its theming API.
// See: https://github.com/reown-com/appkit/issues (file issues for broken theming)
if (typeof window !== 'undefined') {
  const COW_FONT = "'studiofeixen', 'Inter var', 'Inter', Arial, sans-serif"

  /** Detect dark/light mode from CoW Swap's CSS variables */
  function getAppThemeMode(): 'dark' | 'light' {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--cow-color-background').trim()
    return bg === '#000000' || bg === '#000' ? 'dark' : 'light'
  }

  /** Apply CoW Swap theming to AppKit modal */
  function applyCowTheme(): void {
    reownAppKit.setThemeMode(getAppThemeMode())
    reownAppKit.setThemeVariables({
      '--w3m-accent': Color.blue300Primary,
      '--w3m-font-family': COW_FONT,
      '--w3m-border-radius-master': '4px',
      '--w3m-font-size-master': '11px',
    })

    // AppKit doesn't propagate accent to internal token variables — override directly
    const el = document.getElementById('cow-appkit-overrides') || document.createElement('style')
    el.id = 'cow-appkit-overrides'
    el.textContent = `:root {
      --apkt-tokens-core-backgroundAccentPrimary-base: var(--cow-color-primary, ${Color.blue300Primary}) !important;
      --apkt-tokens-core-backgroundAccentPrimary: var(--cow-color-primary, ${Color.blue300Primary}) !important;
      --apkt-fontFamily-regular: ${COW_FONT} !important;
      --apkt-fontFamily-mono: ${COW_FONT} !important;
      --apkt-fontWeight-regular: 500 !important;
    }`
    if (!el.parentNode) document.head.appendChild(el)
  }

  /** Hide "Explore all" (hardcoded 404 link) inside AppKit's nested shadow DOMs */
  function hideExploreAll(): void {
    const modal = document.querySelector('w3m-modal')
    if (!modal?.shadowRoot) return
    const walk = (root: ShadowRoot | Element): void => {
      for (const el of Array.from(root.querySelectorAll('*'))) {
        if (el.getAttribute('name') === 'Explore all') (el as HTMLElement).style.display = 'none'
        if (el.shadowRoot) walk(el.shadowRoot)
      }
    }
    walk(modal.shadowRoot)
  }

  // Wait for AppKit to finish initializing its theme (inserts <style> tags in <head>),
  // then override with CoW Swap theme
  let themeApplied = false
  const headObs = new MutationObserver(() => {
    // AppKit's initializeTheming creates style tags with --apkt- variables
    const hasAppKitStyles = Array.from(document.head.querySelectorAll('style')).some((s) =>
      s.textContent?.includes('--apkt-colors-'),
    )
    if (hasAppKitStyles && !themeApplied) {
      themeApplied = true
      applyCowTheme()
      headObs.disconnect()
    }
  })
  headObs.observe(document.head, { childList: true })

  // Observe the modal for view changes and recursively watch new shadow roots
  function observeModalForExploreAll(): void {
    const modal = document.querySelector('w3m-modal')
    if (!modal?.shadowRoot) return

    const observed = new WeakSet<ShadowRoot>()

    function observeShadowRoot(root: ShadowRoot): void {
      if (observed.has(root)) return
      observed.add(root)
      new MutationObserver(() => {
        hideExploreAll()
        // Watch any newly added shadow roots
        for (const el of Array.from(root.querySelectorAll('*'))) {
          if (el.shadowRoot) observeShadowRoot(el.shadowRoot)
        }
      }).observe(root, { childList: true, subtree: true })
    }

    observeShadowRoot(modal.shadowRoot)
  }

  // Start observing once the modal exists
  const waitForModal = new MutationObserver(() => {
    if (document.querySelector('w3m-modal')) {
      observeModalForExploreAll()
      waitForModal.disconnect()
    }
  })
  waitForModal.observe(document.documentElement, { childList: true, subtree: true })
  if (document.querySelector('w3m-modal')) {
    observeModalForExploreAll()
  }
}
