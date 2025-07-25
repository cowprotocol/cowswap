export const hookDappsRegistry = {
  BUILD_CUSTOM_HOOK: {
    type: 'INTERNAL',
    name: 'Build your own hook',
    descriptionShort: 'Call any smart contract with your own parameters',
    description:
      "Didn't find a suitable hook? You can always create your own! To do this, you need to specify which smart contract you want to call, the parameters for the call and the gas limit.",
    image:
      'https://raw.githubusercontent.com/cowprotocol/cowswap/refs/heads/develop/apps/cowswap-frontend/src/modules/hooksStore/dapps/BuildHookApp/build.png',
    version: 'v0.1.0',
    website: 'https://docs.cow.fi/cow-protocol/tutorials/hook-dapp',
  },
  CLAIM_GNO_FROM_VALIDATORS: {
    type: 'INTERNAL',
    name: 'Claim GNO from validators',
    descriptionShort: 'Withdraw rewards from your Gnosis validators.',
    description:
      "This hook allows you to withdraw rewards from your Gnosis Chain validators through CoW Swap. It automates the process of interacting with the Gnosis Deposit Contract, enabling you to claim any available rewards directly to your specified withdrawal address. The hook monitors your validator's accrued rewards and triggers the claimWithdrawals function when rewards are ready for withdrawal. This simplifies the management of Gnosis validator earnings without requiring ready for withdrawal. This simplifies the management of Gnosis validator earnings without requiring manual contract interaction, providing a smoother and more efficient experience for users.",
    image:
      'https://raw.githubusercontent.com/cowprotocol/cowswap/897ce91ca60a6b2d3823e6a002c3bf64c5384afe/libs/assets/src/cow-swap/network-gnosis-chain-logo.svg',
    version: 'v0.1.1',
    website: 'https://www.gnosis.io',
    conditions: {
      supportedNetworks: [100],
      position: 'pre',
    },
  },
  PERMIT_TOKEN: {
    type: 'INTERNAL',
    name: 'Permit a token',
    descriptionShort: 'Infinite permit an address to spend one token on your behalf.',
    description:
      'This hook allows you to permit an address to spend your tokens on your behalf. This is useful for allowing a smart contract to spend your tokens without needing to approve each transaction.',
    image:
      'https://raw.githubusercontent.com/cowprotocol/cowswap/refs/heads/develop/apps/cowswap-frontend/src/modules/hooksStore/dapps/PermitHookApp/icon.png',
    version: 'v0.1.0',
    website: 'https://docs.cow.fi/cow-protocol/tutorials/hook-dapp',
    conditions: {
      walletCompatibility: ['EOA'],
      supportedNetworks: [11155111],
    },
  },
  CLAIM_COW_AIRDROP: {
    type: 'INTERNAL',
    name: 'Claim COW Airdrop',
    descriptionShort: 'Retrieve COW tokens before or after a swap.',
    description:
      "Effortless Airdrop Claims! The Claim COW Airdrop feature simplifies the process of collecting free COW tokens before or after your swap, seamlessly integrating into the CoW Swap platform. Whether you're claiming new airdrops or exploring CoW on a new network, this tool ensures you get your rewards quickly and easily.",
    image:
      'https://raw.githubusercontent.com/cowprotocol/cowswap/897ce91ca60a6b2d3823e6a002c3bf64c5384afe/apps/cowswap-frontend/src/modules/hooksStore/dapps/AirdropHookApp/airdrop.svg',
    version: 'v0.1.0',
    website: 'https://github.com/bleu/cow-airdrop-contract-deployer',
    conditions: {
      supportedNetworks: [11155111],
    },
  },
  COW_AMM_WITHDRAW: {
    name: 'CoW AMM Withdraw Liquidity',
    type: 'IFRAME',
    descriptionShort: 'Remove liquidity from a CoW AMM pool before the swap',
    description:
      'Reduce or withdraw liquidity from a pool before a token swap integrating the process directly into the transaction flow. By adjusting your liquidity ahead of time, you gain more control over your assets without any extra steps. Optimize your position in a pool, all in one seamless action — no need for multiple transactions or added complexity.',
    version: '0.0.1',
    website: 'https://balancer.fi/pools/cow',
    image: 'https://cow-hooks-dapps-withdraw-pool.vercel.app/icon.png',
    url: 'https://cow-hooks-dapps-withdraw-pool.vercel.app/',
    conditions: {
      position: 'pre',
      walletCompatibility: ['EOA'],
    },
  },
  CLAIM_LLAMAPAY_VESTING: {
    type: 'IFRAME',
    name: 'Claim LlamaPay Vesting Hook',
    description:
      'The Claim LlamaPay Vesting Hook is a powerful and user-friendly feature designed to streamline the process of claiming funds from LlamaPay vesting contracts. This tool empowers users to easily access and manage their vested tokens, ensuring a smooth and efficient experience in handling time-locked assets.',
    descriptionShort: 'Claim your LlamaPay vesting contract funds',
    image: 'https://cow-hooks-dapps-claim-vesting.vercel.app/llama-pay-icon.png',
    version: '0.1.0',
    website: 'https://github.com/bleu/cow-hooks-dapps',
    url: 'https://cow-hooks-dapps-claim-vesting.vercel.app',
    conditions: {
      supportedNetworks: [1, 100, 42161],
      walletCompatibility: ['EOA'],
    },
  },
  CREATE_LLAMAPAY_VESTING: {
    type: 'IFRAME',
    name: 'Create LlamaPay Vesting',
    descriptionShort: 'Create a LlamaPay vesting contract',
    description:
      'This hook allows you to easily set up vesting contracts with LlamaPay. Enter the recipient’s address or ENS name, then choose how much to transfer: the token buy will be automatically detected by the hook and the contracts will be linked to your LlamaPay dashboard for seamless tracking.',
    version: '0.1.0',
    website: 'https://llamapay.io/vesting',
    image: 'https://cow-hooks-dapps-create-vesting.vercel.app/llama-pay-icon.png',
    url: 'https://cow-hooks-dapps-create-vesting.vercel.app',
    conditions: {
      position: 'post',
      walletCompatibility: ['EOA'],
      supportedNetworks: [1, 100, 42161],
    },
  },
  UNI_V2_WITHDRAW: {
    type: 'IFRAME',
    name: 'Withdraw Uniswap v2 Liquidity',
    descriptionShort: 'Remove liquidity from a Uniswap v2 Weighted pool before the swap',
    description:
      'Reduce or withdraw Uniswap v2 from a pool before a token swap integrating the process directly into the transaction flow. By adjusting your liquidity ahead of time, you gain more control over your assets without any extra steps. Optimize your position in a pool, all in one seamless action — no need for multiple transactions or added complexity.',
    version: '0.0.1',
    website: 'https://app.uniswap.org/pools/v2',
    image: 'https://cow-hooks-dapps-withdraw-uniswap-v2.vercel.app/icon.png',
    url: 'https://cow-hooks-dapps-withdraw-uniswap-v2.vercel.app/',
    conditions: {
      position: 'pre',
      walletCompatibility: ['EOA'],
      supportedNetworks: [1, 42161, 11155111, 8453],
    },
  },
  COW_AMM_DEPOSIT: {
    name: 'CoW AMM Deposit',
    type: 'IFRAME',
    descriptionShort: 'Add liquidity to any of the CoW AMM pools',
    description:
      "Easily increase your position in a liquidity pool, adding both tokens in the right ratio.\n\n Whether you're seeking to increase your exposure to specific tokens or maximize the returns from your assets, this tool offers a quick and efficient way to enhance your liquidity position after a token swap, all in a smooth, efficient process.",
    version: '0.0.1',
    website: 'https://balancer.fi/pools/cow',
    image: 'https://cow-hooks-dapps-cow-amm-deposit.vercel.app/icon.png',
    url: 'https://cow-hooks-dapps-cow-amm-deposit.vercel.app/',
    conditions: {
      position: 'post',
      walletCompatibility: ['EOA'],
    },
  },
  UNI_V2_DEPOSIT: {
    name: 'Uniswap v2 Deposit',
    type: 'IFRAME',
    descriptionShort: 'Add liquidity to a Uniswap v2 pool after the swap',
    description:
      "Easily increase your position in a liquidity pool, adding both tokens in the right ratio.\n\n Whether you're seeking to increase your exposure to specific tokens or maximize the returns from your assets, this tool offers a quick and efficient way to enhance your liquidity position after a token swap, all in a smooth, efficient process.",
    version: '0.0.1',
    website: 'https://app.uniswap.org/pools/v2',
    image: 'https://cow-hooks-dapps-9zio.vercel.app/icon.png',
    url: 'https://cow-hooks-dapps-9zio.vercel.app/',
    conditions: {
      position: 'post',
      walletCompatibility: ['EOA'],
      supportedNetworks: [1, 42161, 11155111, 8453],
    },
  },
  MORPHO_BORROW: {
    name: 'Morpho Borrow',
    type: 'IFRAME',
    descriptionShort: 'Supply collateral, borrow, repay and withdraw collateral on Morpho Protocol.',
    description:
      'The Morpho Borrow hook enables users to seamlessly combine swaps with borrow-related actions. Users can enter new positions, leave existing ones, or move between different markets through a unified, streamlined process.',
    version: '0.0.1',
    website: 'https://app.morpho.org/',
    image: 'https://cow-hooks-dapps-morpho-lending.vercel.app/icon.png',
    url: 'https://cow-hooks-dapps-morpho-lending.vercel.app/',
    conditions: {
      walletCompatibility: ['EOA'],
      supportedNetworks: [1, 137, 8453],
    },
  },
  'cow-sdk://bridging/providers/bungee': {
    name: 'Bungee',
    type: 'INTERNAL',
    descriptionShort: 'Bungee Protocol - Swap tokens across chains',
    description:
      'Bungee is a liquidity marketplace that lets you swap into any token on any chain in a fully abstracted manner. Trade any token with the best quotes and a gasless UX!',
    version: '0.0.1',
    website: 'https://www.bungee.exchange',
    image:
      'https://raw.githubusercontent.com/cowprotocol/cow-sdk/refs/heads/main/src/bridging/providers/bungee/bungee-logo.png',
    conditions: {
      walletCompatibility: ['EOA'],
    },
  },
}
