declare module '@metamask/jazzicon' {
  export default function (diameter: number, seed: number): HTMLElement
}

interface Window {
  ethereum?: {
    request<T>(payload: { method: string; params?: unknown[] }): Promise<T>
    isCoinbaseWallet?: true
    isMetaMask?: true
    isRabby?: true
    autoConnect?: true
    providers: unknown[]
  }
}
