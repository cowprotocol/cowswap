import { erc20Abi, maxUint256 } from 'viem'
import type { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { encodeFunctionData } from 'viem'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import { AccountAddress, SignerLike, SupportedChainId } from '@cowprotocol/cow-sdk'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { CowShedSdk, ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { COMPOSABLE_COW_ADDRESS, ComposableCowContractData, CURRENT_BLOCK_FACTORY_ADDRESS, useComposableCowContractData } from 'modules/advancedOrders'

import { buildEoaTwapSetupCalls } from '../../buildEoaTwapSetupCalls'

import { ConditionalOrderParams, TWAPOrder } from '../../../types'
import { TwapOrderCreationContext } from '../../../hooks/useTwapOrderCreationContext'
import { MetaTransactionData } from '@safe-global/types-kit'
import { getCreateTwapOrderCalldata } from 'modules/twap/services/getTwapCreateCalldata'

const DEFAULT_GAS_LIMIT = 600_000n
const FUNDING_ORDER_VALID_FOR_SEC = 1800

// TODO: Move to `@cowprotocol/cow-sdk` just like `import { PERMIT_HOOK_DAPP_ID } from '@cowprotocol/hook-dapp-lib'`?
const EOA_TWAP_SETUP_DAPP_ID = 'cowswap://twap/eoa-setup' // cow-sdk-scripts://composable-cow/post-twap-for-eoa

export interface PlaceEoaTwapOrderParams {
  chainId: SupportedChainId
  account: AccountAddress
  twapOrder: TWAPOrder
  twapOrderCreationContext: null | TwapOrderCreationContext
  paramsStruct: ConditionalOrderParams
  signer: SignerLike
  config: Config
  composableCowContract: ComposableCowContractData
}

export interface PlaceEoaTwapOrderResult {
  sellEqualsBuyOrderId: string
  proxyAddress: AccountAddress
}

/**
 * Places a sell=buy funding order (same TWAP sell token) with post-hooks that
 * approve the vault relayer (when needed) and create the TWAP on ComposableCow via cow-shed.
 * Cow-shed becomes the TWAP owner/trader; TWAP receiver remains the EOA.
 */
export async function placeEoaTwapOrder({
  chainId,
  account,
  twapOrder,
  twapOrderCreationContext,
  paramsStruct,
  signer,
  config,
  composableCowContract
}: PlaceEoaTwapOrderParams): Promise<PlaceEoaTwapOrderResult> {
  if (!twapOrderCreationContext || !signer) throw new Error('twapOrderCreationContext and signer are required')

  const { /*composableCowContract, needsApproval, needsZeroApproval, */ spender, currentBlockFactoryAddress } = twapOrderCreationContext

  const { sellAmount } = twapOrder
  const sellTokenAddress = sellAmount.currency.address
  const sellAmountAtoms = maxUint256

  // spender comes from TwapUpdaters. TWAP orders always approve against the production vault relayer regardless of the current environment.
  const vaultRelayerAddress = spender

  // TODO: This can probably be accessed using a version one published:
  const cowShedSdk = new CowShedSdk(undefined, {
    factoryAddress: "0x4f4350bf2c74aacd508d598a1ba94ef84378793d",
    implementationAddress: "0x6773d5aA31A1EAD34127D564D6E258E66254EbDb",
    proxyCreationCode:
      "0x60a03461009557601f61033d38819003918201601f19168301916001600160401b0383118484101761009957808492604094855283398101031261009557610052602061004b836100ad565b92016100ad565b6080527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5560405161027b90816100c28239608051818181608b01526101750152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b03821682036100955756fe60806040526004361015610018575b3661019757610197565b5f3560e01c8063025b22bc146100375763f851a4400361000e57610116565b346101125760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101125760043573ffffffffffffffffffffffffffffffffffffffff81169081810361011257337f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff160361010d577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f80a2005b61023d565b5f80fd5b34610112575f7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261011257602061014e61016c565b73ffffffffffffffffffffffffffffffffffffffff60405191168152f35b33300361010d577f000000000000000000000000000000000000000000000000000000000000000090565b60ff7f68df44b1011761f481358c0f49a711192727fb02c377d697bcb0ea8ff8393ac0541615806101f0575b1561023d577ff92ee8a9000000000000000000000000000000000000000000000000000000005f5260045ffd5b507fc4d66de8000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000005f351614156101c3565b5f807f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc54368280378136915af43d5f803e15610277573d5ff35b3d5ffd",
  });

  // proxyAddress (quote receiver) is a special shed with support for Composable Cow. See https://github.com/cowdao-grants/cow-shed/pull/53
  const proxyAddress = cowShedSdk.getCowShedAccount(chainId, account) as AccountAddress;

  console.log("CowShed account:", proxyAddress);

  // Define trade parameters
  const { buyAmount, numOfParts } = twapOrder
  const sellToken = sellAmount.currency
  const buyToken = buyAmount.currency
  const sellAmountFormatted = sellAmount.toExact()

  console.log(
    `TWAP sell ${sellAmountFormatted} ${sellToken.symbol} for ${buyToken.symbol} in ${numOfParts} parts.
To create the TWAP we will use an intermediate sell=buy order with a post hook:
  - Buy ${sellAmountFormatted} ${sellToken.symbol} with ${sellToken.symbol}, sent to ${proxyAddress}
  - Post-hook will create the TWAP using cow-shed. Each part sells ${sellToken.symbol} for ${buyToken.symbol}`,
  )

  /*
  console.log("TWAP ID:", twapOrder.id);
  console.log("TWAP params for cereation of order", {
    twapParams: twapOrder.leaf,
    twapData: debugStringify(twapOrder.data),
    twapAppDataContent: twapOrder.appData,
  });
  */

  /*
  // Already included in twapOrderCreationContext
  const needsApproval = await getProxyNeedsVaultRelayerApproval({
    config,
    sellTokenAddress: sellToken.address,
    proxyAddress,
    vaultRelayerAddress,
    sellAmountAtoms,
  })

  // TODO: To be implemented...
  const needsZeroApproval = false;
  */

  const setupCalls = buildEoaTwapSetupCalls({
    sellTokenAddress: sellToken.address,
    vaultRelayerAddress,
    composableCowContract,
    currentBlockFactoryAddress: currentBlockFactoryAddress as `0x${string}`,
    paramsStruct,
    needsApproval: twapOrderCreationContext.needsApproval,
    needsZeroApproval: twapOrderCreationContext.needsZeroApproval,
  })

  const deadline = BigInt(Math.ceil(Date.now() / 1000)) + BigInt(FUNDING_ORDER_VALID_FOR_SEC)

  const { signedMulticall, gasLimit } = await cowShedSdk.signCalls({
    chainId,
    calls: setupCalls,
    deadline,
    signer,
    defaultGasLimit: DEFAULT_GAS_LIMIT,
  })

  const { quoteResults, postSwapOrderFromQuote } = await tradingSdk.getQuote(
    {
      kind: OrderKind.BUY,
      sellToken: sellToken.address,
      sellTokenDecimals: sellToken.decimals,
      buyToken: sellToken.address,
      buyTokenDecimals: sellToken.decimals,
      amount: sellAmountAtoms.toString(),
      receiver: proxyAddress,
      owner: account,
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

  // Print the quote
  printQuote(quoteResults);



  // Ask for confirmation before posting the order
  const confirmed = await confirm(
    `Your CoW Shed will get exactly ${sellAmountFormatted} ${twapSellToken.symbol} for at most ${sellAmountIntialTradeFormatted} ${beforeTwapSellToken.symbol}. Then a TWAP will be created with each part selling ${twapSellToken.symbol} for ${twapBuyToken.symbol}. ok?`
  );

  if (!confirmed) return;

  const { orderId: sellEqualsBuyOrderId } = await postSwapOrderFromQuote()

  return { sellEqualsBuyOrderId, proxyAddress }
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




export interface GetEoaTwapOrderShedCallsParams {
  twapOrder: TWAPOrder
  twapOrderCreationContext: TwapOrderCreationContext
  paramsStruct: ConditionalOrderParams
}

export function getEoaTwapOrderShedCalls({
  twapOrder,
  twapOrderCreationContext,
  paramsStruct,
}: GetEoaTwapOrderShedCallsParams): ICoWShedCall[] {
  const { composableCowContract, needsApproval, needsZeroApproval, spender, currentBlockFactoryAddress } = twapOrderCreationContext

  if (!currentBlockFactoryAddress) {
    throw new Error('currentBlockFactoryAddress is required to create a TWAP order')
  }

  const { sellAmount } = twapOrder
  const sellTokenAddress = sellAmount.currency.address
  const sellAmountAtoms = maxUint256

  // At the very lest, we need the create order tx:
  const txs: ICoWShedCall[] = [{
    // to: composableCowContract.address,
    target: composableCowContract.address,
    // data: getCreateTwapOrderCalldata({
      callData: getCreateTwapOrderCalldata({
      composableCowContractAbi: composableCowContract.abi,
      paramsStruct,
      currentBlockFactoryAddress,
    }),
    // With MetaTransactionData:
    //value: '0',
    //operation: 0,

    // With ICoWShedCall:
    value: 0n,
    isDelegateCall: false,
    allowFailure: false,
  }]

  // spender = vaultRelayerAddress

  if (needsApproval) {
    // If we need to approve the sell token, we need to add the approve tx first:
    const approveTx: ICoWShedCall = {
      // to: sellTokenAddress,
      target: sellTokenAddress,
      // data: encodeFunctionData({
      callData: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        // TODO: Check if this is using useTradeSpenderAddress properly
        args: [spender as `0x${string}`, sellAmountAtoms],
      }),
      // With MetaTransactionData:
      //value: '0',
      //operation: 0,

      // With ICoWShedCall:
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    }

    txs.unshift(approveTx)
  }

  if (needsZeroApproval) {
    // Some USDT-style tokens require resetting the allowance to zero before we set a new allowance:
    const zeroApproveTx: ICoWShedCall = {
      // to: sellTokenAddress,
      target: sellTokenAddress,
      //data: encodeFunctionData({
      callData: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as `0x${string}`, 0n],
      }),
      // With MetaTransactionData:
      //value: '0',
      //operation: 0,

      // With ICoWShedCall:
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    }

    txs.unshift(zeroApproveTx)
  }

  return txs
}
