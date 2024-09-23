import { HookDappIframe, HookDappType, HookDappWalletCompatibility } from './types/hooks'

export const OMNIBRIDGE_POST_HOOK: HookDappIframe = {
  url: 'http://localhost:3000/hook-dapp-omnibridge/',
  type: HookDappType.IFRAME,
  name: 'Omnibridge',
  descriptionShort: 'Bridge from Gnosis Chain to Mainnet',
  description:
    'The Omnibridge can be used to bridge ERC-20 tokens between Ethereum and Gnosis. The first time a token is bridged, a new ERC677 token contract is deployed on GC with an additional suffix to differentiate the token. It will say "token name on xDai", as this was the original chain name prior to re-branding. If a token has been bridged previously, the previously deployed contract is used. The requested token amount is minted and sent to the account initiating the transfer (or an alternative receiver account specified by the sender).',
  version: '0.0.1',
  website: 'https://omni.legacy.gnosischain.com',
  image: 'http://localhost:3000/hook-dapp-omnibridge/android-chrome-192x192.png',
  walletCompatibility: [HookDappWalletCompatibility.EOA, HookDappWalletCompatibility.SMART_CONTRACT],
}
