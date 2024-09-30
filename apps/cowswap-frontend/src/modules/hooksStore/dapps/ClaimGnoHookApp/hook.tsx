import gnoLogo from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'

import { HookDappInternal, HookDappType, HookDappWalletCompatibility } from '../../types/hooks'

import { ClaimGnoHookApp } from './index'

export const PRE_CLAIM_GNO: HookDappInternal = {
  name: 'Claim GNO from validators',
  descriptionShort: 'Withdraw rewards from your Gnosis validators.',
  description: (
    <>
      This hook allows you to withdraw rewards from your Gnosis Chain validators through CoW Swap. It automates the
      process of interacting with the Gnosis Deposit Contract, enabling you to claim any available rewards directly to
      your specified withdrawal address.
      <br />
      <br />
      The hook monitors your validator's accrued rewards and triggers the claimWithdrawals function when rewards are
      ready for withdrawal. This simplifies the management of Gnosis validator earnings without requiring ready for
      withdrawal. This simplifies the management of Gnosis validator earnings without requiring manual contract
      interaction, providing a smoother and more efficient experience for users.
    </>
  ),
  type: HookDappType.INTERNAL,
  component: (props) => <ClaimGnoHookApp {...props} />,
  image: gnoLogo,
  version: 'v0.1.1',
  website: 'https://www.gnosis.io/',
  walletCompatibility: [HookDappWalletCompatibility.SMART_CONTRACT, HookDappWalletCompatibility.EOA],
}
