declare module '@metamask/jazzicon' {
  export default function (diameter: number, seed: number): HTMLElement
}

interface Window {
  ethereum?: {
    isCoinbaseWallet?: true
    isMetaMask?: true
    isRabby?: true
    autoConnect?: true
    providers: unknown[]
  }
}
