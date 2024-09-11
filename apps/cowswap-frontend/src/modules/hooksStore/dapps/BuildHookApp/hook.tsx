import buildImg from './build.png'

import { HookDappInternal, HookDappType } from '../../types/hooks'

import { BuildHookApp } from './index'

const getAppDetails = (isPreHook: boolean): HookDappInternal => {
  return {
    name: `Build your own ${isPreHook ? 'Pre' : 'Post'}-hook`,
    description: `Didn't find a suitable hook? You can always create your own! To do this, you need to specify which smart contract you want to call, the parameters for the call and the gas limit.`,
    type: HookDappType.INTERNAL,
    image: buildImg,
    component: (props) => <BuildHookApp {...props} />,
    version: 'v0.1.0',
  }
}

export const PRE_BUILD = getAppDetails(true)
export const POST_BUILD = getAppDetails(false)
