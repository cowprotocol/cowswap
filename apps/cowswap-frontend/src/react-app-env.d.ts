/// <reference types="react-scripts" />

declare module '*.md'

declare module '@metamask/jazzicon' {
  export default function(diameter: number, seed: number): HTMLElement
}

interface TelegramData {
  auth_date: number
  first_name: string
  hash: string
  id: number
  photo_url: string
  username: string
}

interface Window {
  console: Console & { force: Console }
  // walletLinkExtension is injected by the Coinbase Wallet extension
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletLinkExtension?: any
  ethereum?: {
    // value that is populated and returns true by the Coinbase Wallet mobile dapp browser
    isCoinbaseWallet?: true
    isMetaMask?: true
    isRabby?: true
    autoRefreshOnNetworkChange?: boolean
    autoConnect?: boolean
    setSelectedProvider: (any) => void
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    providers: [any]
    isTrust?: boolean
    isTrustWallet?: boolean
  }
  web3?: Record<string, unknown>
  Telegram?: {
    Login: {
      auth(options: {
        bot_id: number,
        lang?: string,
        request_access?: string
      }, callback: (data: TelegramData | false) => void): void
    }
  }
}

interface Console extends Node.Console {
  force: Node.Console
}

declare module 'content-hash' {
  declare function decode(x: string): string

  declare function getCodec(x: string): string
}

declare module 'multihashes' {
  declare function decode(buff: Uint8Array): { code: number; name: string; length: number; digest: Uint8Array }

  declare function toB58String(hash: Uint8Array): string
}
