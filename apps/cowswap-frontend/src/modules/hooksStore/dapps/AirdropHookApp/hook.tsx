import { HookDappInternal, HookDappType } from 'modules/hooksStore/types/hooks'

import { AirdropHookApp } from './index'

export const PRE_AIRDROP: HookDappInternal = {
  name: 'TODO',
  description: 'TODO',
  descriptionShort: 'TODO',
  type: HookDappType.INTERNAL,
  image:
    'https://static.vecteezy.com/system/resources/previews/017/317/302/original/an-icon-of-medical-airdrop-editable-and-easy-to-use-vector.jpg',
  component: (props) => <AirdropHookApp {...props} />,
  version: '0.1.0',
  website: 'TODO',
}
