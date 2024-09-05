import { HookDappInternal, HookDappType } from '@cowprotocol/types'

import buildImg from './build.png'

import { BuildHookApp } from './index'

const getAppDetails = (isPreHook: boolean): HookDappInternal => {
  return {
    name: `Build your own ${isPreHook ? 'Pre' : 'Post'}-hook`,
    descriptionShort: "Call any smart contract with your own parameters",
    description: `Didn't find a suitable hook? You can always create your own! To do this, you need to specify which smart contract you want to call, the parameters for the call and the gas limit.`,
    type: HookDappType.INTERNAL,
    image: buildImg,
    component: (props) => <BuildHookApp {...props} />,
    version: 'v0.1.0',
    website: 'https://docs.cow.fi/cow-protocol/reference/core/intents/hooks',
  }
}

export const PRE_BUILD = getAppDetails(true)
export const POST_BUILD = getAppDetails(false)
