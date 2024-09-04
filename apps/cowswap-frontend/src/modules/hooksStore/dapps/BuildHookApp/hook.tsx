import { HookDappInternal, HookDappType } from '@cowprotocol/types'

import buildImg from './build.png'

import { BuildHookApp } from './index'

const getAppDetails = (isPreHook: boolean): HookDappInternal => {
  return {
    name: `Build your own ${isPreHook ? 'Pre' : 'Post'}-hook`,
    description: `Add an arbitrary calldata to be executed ${isPreHook ? 'before' : 'after'} your hook`,
    type: HookDappType.INTERNAL,
    image: buildImg,
    component: (props) => <BuildHookApp {...props} />,
    version: 'v0.1.0',
  }
}

export const PRE_BUILD = getAppDetails(true)
export const POST_BUILD = getAppDetails(false)