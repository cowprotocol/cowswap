import { HookDappInternal, HookDappType } from 'modules/hooksStore/types/hooks'

import airdropImage from './airdrop.svg'

import { AirdropHookApp } from './index'

const Description = () => {
  return (
    <>
      <p>
        <strong>Effortless Airdrop Claims! </strong>
        The Claim COW Airdrop feature simplifies the process of collecting free COW tokens before or after your swap,
        seamlessly integrating into the CoW Swap platform.
      </p>
      <br />
      <p>
        Whether you're claiming new airdrops or exploring CoW on a new network, this tool ensures you get your rewards
        quickly and easily.
      </p>
    </>
  )
}

export const AIRDROP_HOOK_APP: HookDappInternal = {
  name: 'Claim COW Airdrop',
  description: <Description />,
  descriptionShort: 'Retrieve COW tokens before a swap',
  type: HookDappType.INTERNAL,
  image: airdropImage,
  component: (props) => <AirdropHookApp {...props} />,
  version: '0.1.0',
  website: 'https://github.com/bleu/cow-airdrop-contract-deployer',
}
