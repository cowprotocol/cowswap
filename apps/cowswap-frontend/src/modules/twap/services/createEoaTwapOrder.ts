import { erc20Abi } from 'viem'
import type { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import type { AccountAddress, SignerLike, SupportedChainId } from '@cowprotocol/cow-sdk'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { COMPOSABLE_COW_ADDRESS, CURRENT_BLOCK_FACTORY_ADDRESS, useComposableCowContractData } from 'modules/advancedOrders'

import { buildEoaTwapSetupCalls } from './buildEoaTwapSetupCalls'

import { ConditionalOrderParams, TWAPOrder } from '../types'

const DEFAULT_GAS_LIMIT = 600_000n
const FUNDING_ORDER_VALID_FOR_SEC = 1800
const EOA_TWAP_SETUP_DAPP_ID = 'cowswap://twap/eoa-setup'

export interface CreateEoaTwapOrderParams {
  chainId: SupportedChainId
  account: string
  twapOrder: TWAPOrder
  paramsStruct: ConditionalOrderParams
  signer: SignerLike
  config: Config
}

export interface CreateEoaTwapOrderResult {
  fundingOrderId: string
  proxyAddress: string
}

/**
 * Places a sell=buy funding order (same TWAP sell token) with post-hooks that
 * approve the vault relayer (when needed) and create the TWAP on ComposableCow via cow-shed.
 * Cow-shed becomes the TWAP owner/trader; TWAP receiver remains the EOA.
 */
export async function createEoaTwapOrder(params: CreateEoaTwapOrderParams): Promise<CreateEoaTwapOrderResult> {
  const { chainId, account, twapOrder, paramsStruct, signer, config } = params

  const sellToken = twapOrder.sellAmount.currency
  const sellAmountAtoms = BigInt(twapOrder.sellAmount.quotient.toString())
  const vaultRelayerAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]
  const composableCowContract = useComposableCowContractData()
  const currentBlockFactoryAddress = CURRENT_BLOCK_FACTORY_ADDRESS[chainId]

  const cowShedSdk = new CowShedSdk()
  const proxyAddress = cowShedSdk.getCowShedAccount(chainId, account)

  const cowShedSdk2 = new CowShedSdk(undefined, {
    factoryAddress: "0x4f4350bf2c74aacd508d598a1ba94ef84378793d",
    implementationAddress: "0x6773d5aA31A1EAD34127D564D6E258E66254EbDb",
    proxyCreationCode:
      "0x60a03461009557601f61033d38819003918201601f19168301916001600160401b0383118484101761009957808492604094855283398101031261009557610052602061004b836100ad565b92016100ad565b6080527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5560405161027b90816100c28239608051818181608b01526101750152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b03821682036100955756fe60806040526004361015610018575b3661019757610197565b5f3560e01c8063025b22bc146100375763f851a4400361000e57610116565b346101125760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101125760043573ffffffffffffffffffffffffffffffffffffffff81169081810361011257337f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff160361010d577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f80a2005b61023d565b5f80fd5b34610112575f7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261011257602061014e61016c565b73ffffffffffffffffffffffffffffffffffffffff60405191168152f35b33300361010d577f000000000000000000000000000000000000000000000000000000000000000090565b60ff7f68df44b1011761f481358c0f49a711192727fb02c377d697bcb0ea8ff8393ac0541615806101f0575b1561023d577ff92ee8a9000000000000000000000000000000000000000000000000000000005f5260045ffd5b507fc4d66de8000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000005f351614156101c3565b5f807f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc54368280378136915af43d5f803e15610277573d5ff35b3d5ffd",
  });

  const proxyAddress2 = cowShedSdk2.getCowShedAccount(chainId, account);

  console.log(proxyAddress, proxyAddress2, proxyAddress === proxyAddress2);

  throw new Error("Just testing");

  /*

  const needsApproval = await getProxyNeedsVaultRelayerApproval({
    config,
    sellTokenAddress: sellToken.address,
    proxyAddress,
    vaultRelayerAddress,
    sellAmountAtoms,
  })

  // TODO: To be implemented...
  const needsZeroApproval = false;

  const setupCalls = buildEoaTwapSetupCalls({
    sellTokenAddress: sellToken.address,
    vaultRelayerAddress,
    composableCowContract,
    currentBlockFactoryAddress,
    paramsStruct,
    needsApproval,
    needsZeroApproval,
  })

  const deadline = BigInt(Math.ceil(Date.now() / 1000)) + BigInt(FUNDING_ORDER_VALID_FOR_SEC)

  const { signedMulticall, gasLimit } = await cowShedSdk.signCalls({
    chainId,
    calls: setupCalls,
    deadline,
    signer,
    defaultGasLimit: DEFAULT_GAS_LIMIT,
  })

  const { postSwapOrderFromQuote } = await tradingSdk.getQuote(
    {
      kind: OrderKind.BUY,
      sellToken: sellToken.address,
      sellTokenDecimals: sellToken.decimals,
      buyToken: sellToken.address,
      buyTokenDecimals: sellToken.decimals,
      amount: sellAmountAtoms.toString(),
      receiver: proxyAddress,
      owner: account as AccountAddress,
      partiallyFillable: false,
      validFor: FUNDING_ORDER_VALID_FOR_SEC,
      signer,
    },
    {
      appData: {
        metadata: {
          hooks: {
            post: [
              {
                target: signedMulticall.to,
                callData: signedMulticall.data,
                gasLimit: gasLimit.toString(),
                dappId: EOA_TWAP_SETUP_DAPP_ID,
              },
            ],
          },
        },
      },
    },
  )

  const { orderId: fundingOrderId } = await postSwapOrderFromQuote()

  return { fundingOrderId, proxyAddress }
  */
}

async function getProxyNeedsVaultRelayerApproval(params: {
  config: Config
  sellTokenAddress: string
  proxyAddress: string
  vaultRelayerAddress: string
  sellAmountAtoms: bigint
}): Promise<boolean> {
  const { config, sellTokenAddress, proxyAddress, vaultRelayerAddress, sellAmountAtoms } = params

  try {
    const allowance = await readContract(config, {
      address: sellTokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [proxyAddress as `0x${string}`, vaultRelayerAddress as `0x${string}`],
    })

    return allowance < sellAmountAtoms
  } catch {
    // Undeployed proxy / RPC issues: include approve so the post-hook still sets it up.
    return true
  }
}
