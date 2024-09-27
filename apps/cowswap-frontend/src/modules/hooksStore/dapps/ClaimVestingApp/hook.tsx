import { HookDappIframe, HookDappType, HookDappWalletCompatibility } from 'modules/hooksStore/types/hooks'

const claimVestingBaseUrl = 'https://cow-hooks-dapps-claim-vesting.vercel.app'
const claimVestingIconName = 'llama-pay-icon.png'

const Description = () => {
  return (
    <>
      <p>
        The Claim Vesting Hook is a powerful and user-friendly feature designed to streamline the process of claiming
        funds from LlamaPay vesting contracts.
      </p>
      <br />
      <p>
        This tool empowers users to easily access and manage their vested tokens, ensuring a smooth and efficient
        experience in handling time-locked assets.
      </p>
    </>
  )
}

export const CLAIM_VESTING_APP: HookDappIframe = {
  name: 'Claim Vesting Hook',
  description: <Description />,
  descriptionShort: 'Claim your LlamaPay vesting contract funds',
  type: HookDappType.IFRAME,
  image: `${claimVestingBaseUrl}/${claimVestingIconName}`,
  version: '0.1.0',
  website: 'https://github.com/bleu/cow-hooks-dapps',
  url: claimVestingBaseUrl,
  walletCompatibility: [HookDappWalletCompatibility.EOA, HookDappWalletCompatibility.SMART_CONTRACT],
}
