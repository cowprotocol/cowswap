import permitImg from './icon.png'

import { HookDappInternal, HookDappType, HookDappWalletCompatibility } from '../../types/hooks'

import { PermitHookApp } from './index'

export const PERMIT_HOOK: HookDappInternal = {
  name: `Permit a token`,
  descriptionShort: 'Infinite permit an address to spend one token on your behalf',
  description: `This hook allows you to permit an address to spend your tokens on your behalf. This is useful for allowing a smart contract to spend your tokens without needing to approve each transaction.`,
  type: HookDappType.INTERNAL,
  image: permitImg,
  component: (props) => <PermitHookApp {...props} />,
  version: 'v0.1.0',
  website: 'https://docs.cow.fi/cow-protocol/reference/core/intents/hooks',
  walletCompatibility: [HookDappWalletCompatibility.EOA],
}
