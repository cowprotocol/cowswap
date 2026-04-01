# MetaMask Connect (what changed)

We used to wire MetaMask through **`@metamask/sdk`**. MetaMask’s direction now is **`@metamask/connect-evm`** — same idea (connect from the browser, including mobile deeplinks), but it’s the supported stack and it lines up with their multichain client.

**What actually changed in code**

- The old SDK connector files are gone; this folder is the **`MetaMaskConnect`** web3-react connector. It **dynamic-imports** `@metamask/connect-evm`, calls **`createEVMClient`**, and plugs the returned EIP-1193 provider into web3-react like any other wallet.
- **`ConnectionType.METAMASK`** is still the same enum value — we didn’t invent a second “flavour” of MetaMask in the app.
- **Mobile:** we stopped hiding the MetaMask Connect row just because the user is on a phone. If there’s **no** injected MetaMask (normal mobile Safari/Chrome), they see the MetaMask tile and go through Connect. If they’re **already** inside MetaMask’s browser or something that announces `io.metamask` via EIP-6963, we **don’t** show that duplicate row — they use the injected wallet entry.
- We pass **`mobile: { useDeeplink: true }`** into `createEVMClient` so opening the MetaMask app prefers the native `metamask://` style links (same spirit as the old SDK’s deeplink behaviour).

**Where to look**

- Connector implementation: `index.ts` in this folder.
- Web3-react registration + CoW RPC metadata: `connection/metaMaskConnect.tsx`.
- The orange MetaMask button in the modal: `connection/metaMaskConnectOption.tsx`.
- When that button appears: `ConnectWalletOptions.tsx` in cowswap-frontend (`showMetaMaskConnectOption`).

If something feels off on a specific device, check whether you’re in the extension, in-app browser, or a plain mobile browser — that changes whether MetaMask is “injected” or you need the Connect flow.
