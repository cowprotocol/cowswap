import buildImg from './build.png'

import { HookDappInternal, HookDappType } from '../../types/hooks'

import { PermitHookApp } from './index'

export const PRE_PERMIT: HookDappInternal = {
  name: `Permit one token`,
  descriptionShort: 'Infinite permit an address to spend one token on your behalf',
  description: `This hook allows you to permit an address to spend your tokens on your behalf. This is useful for allowing a smart contract to spend your tokens without needing to approve each transaction.`,
  type: HookDappType.INTERNAL,
  image: buildImg,
  component: (props) => <PermitHookApp {...props} />,
  version: 'v0.1.0',
  website: 'https://docs.cow.fi/cow-protocol/reference/core/intents/hooks',
}
