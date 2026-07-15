import { type Address, encodeFunctionData, erc20Abi, maxUint256 } from 'viem'
import type { Config } from 'wagmi'
import { getPublicClient, readContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { calculateGasMargin, COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD } from '@cowprotocol/common-utils'
import { AccountAddress, isEvmChain, QuoteResults, SignerLike, SupportedChainId, areAddressesEqual } from '@cowprotocol/cow-sdk'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { CowShedSdk, ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { ComposableCowContractData } from 'modules/advancedOrders'
import { estimateApprove } from 'modules/erc20Approve'
import { getCreateTwapOrderCalldata } from 'modules/twap/services/getTwapCreateCalldata'
import { shouldZeroApprove } from 'modules/zeroApproval/hooks/useShouldZeroApprove'

import { TwapOrderCreationContext } from '../../../hooks/useTwapOrderCreationContext'
import { ConditionalOrderParams, TWAPOrder } from '../../../types'

const DEFAULT_GAS_LIMIT = 600_000n
const FUNDING_ORDER_VALID_FOR_SEC = 1800

// TODO: Move to `@cowprotocol/cow-sdk` just like `import { PERMIT_HOOK_DAPP_ID } from '@cowprotocol/hook-dapp-lib'`?
const EOA_TWAP_SETUP_DAPP_ID = 'cowswap://twap/eoa-setup' // cow-sdk-scripts://composable-cow/post-twap-for-eoa

// TODO: Why is this using a Uniswap v4 contract in Anxos POC (See apps/cowswap-frontend/src/pages/error/AnySwapAffectedUsers/useIsAnySwapAffectedUser.ts)?
// export const COW_VAULT_RELAYER_CONTRACT = "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110";

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
}: PlaceEoaTwapOrderParams): Promise<PlaceEoaTwapOrderResult> {
  if (!twapOrderCreationContext || !signer) throw new Error('twapOrderCreationContext and signer are required')

  const { spender } = twapOrderCreationContext

  const { sellAmount } = twapOrder
  const sellTokenAddress = sellAmount.currency.address as `0x${string}`
  const sellAmountAtoms = sellAmount.quotient
  const vaultRelayerAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD[chainId]

  if (!vaultRelayerAddress) {
    throw new Error(`Vault relayer address is not configured for chain ${chainId}`)
  } else if (!areAddressesEqual(spender, vaultRelayerAddress)) {
    throw new Error(`The spender should be the Vault Relayer`)
  }

  // spender comes from TwapUpdaters. TWAP orders always approve against the production vault relayer regardless of the current environment.
  // const vaultRelayerAddress = spender

  // TOOD: Do we need to show as unfillable orders where the TWAP proxy allowance is not enough, or can we assume that should never happen?

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

  const proxyAllowances = await getProxyAllowances({
    config,
    sellAmount,
    proxyAddress,
    spender: spender as `0x${string}`,
  })

  const calls = getEoaTwapOrderShedCalls({
    twapOrder,
    twapOrderCreationContext,
    paramsStruct,
    proxyAllowances,
  })

  const deadline = BigInt(Math.ceil(Date.now() / 1000)) + BigInt(FUNDING_ORDER_VALID_FOR_SEC)

  const { signedMulticall, gasLimit } = await cowShedSdk.signCalls({
    chainId,
    calls,
    deadline,
    signer,
    defaultGasLimit: DEFAULT_GAS_LIMIT,
    // TODO: Could the estimation be too low for newly created sheds?
    // gasLimit: DEFAULT_GAS_LIMIT,
  })

  console.log("Signed multicall=", signedMulticall);

  // TODO: We might want to quote differently for Safe vs EOA TWAPs, and then send the quoteId here
  // to skip this getQuote call:

  // This sell=buy order's only purpose is to create the TWAP. We use a BUY sell=buy order so that the buy amount
  // we get (into the proxy account) matches the intended sell amount of the actual TWAP. So, solver will
  // compete to offer the best (lowest) sell amount for the TWAP, which at the very least = buy amount + gas costs.

  const { quoteResults, postSwapOrderFromQuote } = await tradingSdk.getQuote(
    {
      kind: OrderKind.BUY,
      sellToken: sellToken.address,
      sellTokenDecimals: sellToken.decimals,
      buyToken: sellToken.address,
      buyTokenDecimals: sellToken.decimals,
      // BUY sell=buy order = TWAP sell amoun:
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
              // Approve and create the TWAP
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
  printQuote(quoteResults)

  // Funding order sell size from the quote (BUY sell=buy after costs/slippage), which can exceed TWAP sell size.
  const fundingSellAmountAtoms = quoteResults.amountsAndCosts.afterSlippage.sellAmount
  const fundingSellAmount = CurrencyAmount.fromRawAmount(sellToken, fundingSellAmountAtoms.toString())
  const fundingSellAmountFormatted = fundingSellAmount.toExact()

  // Ask for confirmation before posting the order
  const confirmed = confirm(
    `Your CoW Shed will get exactly ${sellAmountFormatted} ${sellToken.symbol} for at most ${fundingSellAmountFormatted} ${sellToken.symbol}. Then a TWAP will be created with each part selling ${sellToken.symbol} for ${buyToken.symbol}. ok?`,
  )

  if (!confirmed) throw new Error('User did not confirm the order')

  // TODO: Maybe easier to use useApproveCallback before calling placeEoaTwapOrder, extract this logic so that it can also be used without hooks.

  // TODO: We could bundle a permit instead for permittable tokens.

  // Give allowance from the EOA to the Vault Relayer to pull the sell token needed for the BUY sell=buy order
  // (not the shed/proxy path).
  //
  // Do not use twapOrderCreationContext.needsApproval / needsZeroApproval here: those flags compare the EOA
  // allowance to the form TWAP sell size. The funding order's quoted sell amount (BUY sell=buy after costs /
  // slippage) can be higher, so re-check against the quote and approve max if short.
  const eoaAllowance = await readContract(config, {
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account, spender],
  }).catch(() => 0n)

  const eoaNeedsApproval = eoaAllowance < fundingSellAmountAtoms

  const eoaNeedsZeroApproval = eoaNeedsApproval
    ? !!(await shouldZeroApprove({
        tokenAddress: sellTokenAddress,
        owner: account,
        spender,
        amountToApprove: fundingSellAmount,
        forceApprove: true,
        config,
      }))
    : false

  if (eoaNeedsZeroApproval) {
    await approveEoaSellToken({
      config,
      chainId,
      account,
      sellTokenAddress,
      spender,
      amount: 0n,
    })
  }

  if (eoaNeedsApproval) {
    await approveEoaSellToken({
      config,
      chainId,
      account,
      sellTokenAddress,
      spender,
      amount: maxUint256,
    })
  }

  const { orderId: sellEqualsBuyOrderId } = await postSwapOrderFromQuote()

  return { sellEqualsBuyOrderId, proxyAddress }
}

interface ApproveEoaSellTokenParams {
  config: Config
  chainId: SupportedChainId
  account: AccountAddress
  sellTokenAddress: Address
  spender: string
  amount: bigint
}

async function approveEoaSellToken({
  config,
  chainId,
  account,
  sellTokenAddress,
  spender,
  amount,
}: ApproveEoaSellTokenParams): Promise<void> {
  if (!isEvmChain(chainId)) {
    throw new Error(`Unsupported chain for approve: ${chainId}`)
  }

  const publicClient = getPublicClient(config)

  if (!publicClient) {
    throw new Error('Public client is required to approve sell token')
  }

  const estimation = await estimateApprove(
    publicClient,
    sellTokenAddress,
    spender,
    amount,
    account,
    chainId,
  )

  const hash = await writeContract(config, {
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender as Address, amount],
    gas: calculateGasMargin(estimation.gasLimit),
    account,
  })

  await waitForTransactionReceipt(config, { hash })
}

export interface GetProxyAllowancesParams {
  config: Config
  sellAmount: CurrencyAmount<Token>
  proxyAddress: AccountAddress
  spender: AccountAddress
}

export interface GetProxyAllowancesResult {
  needsApproval: boolean
  needsZeroApproval: boolean
}

async function getProxyAllowances({
  config,
  sellAmount,
  proxyAddress,
  spender,
}: GetProxyAllowancesParams): Promise<GetProxyAllowancesResult> {
  const sellTokenAddress = sellAmount.currency.address
  const sellAmountAtoms = sellAmount.quotient

  const proxyAllowance = await readContract(config, {
    address: sellTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [proxyAddress, spender],
  }).catch(() => {
    // Include approve so the post-hook still sets it up if there's any kind of issue:
    return 0;
  })

  const needsApproval = proxyAllowance < sellAmountAtoms

  const needsZeroApproval = needsApproval ? (await shouldZeroApprove({
    tokenAddress: sellTokenAddress,
    // TODO: Verify this works propery
    owner: proxyAddress as `0x${string}`,
    spender: spender,
    amountToApprove: sellAmount,
    forceApprove: true,
    config,
  }))!! : false

  return {
    needsApproval,
    needsZeroApproval,
  }
}

export interface GetEoaTwapOrderShedCallsParams {
  twapOrder: TWAPOrder
  twapOrderCreationContext: TwapOrderCreationContext
  paramsStruct: ConditionalOrderParams
  proxyAllowances: {
    needsApproval: boolean
    needsZeroApproval: boolean
  }
}

/**
 * Builds cow-shed multicall that runs after the BUY sell=buy order as a post-hook:
 * - Optionally zero-approve the TWAP proxy (vault relayer)
 * - Optionally approve the TWAP proxy (vault relayer)
 * - Ceate the TWAP on ComposableCow (owner = shed).
 */
export function getEoaTwapOrderShedCalls({
  twapOrder,
  twapOrderCreationContext,
  paramsStruct,
  proxyAllowances,
}: GetEoaTwapOrderShedCallsParams): ICoWShedCall[] {
  // Note: `twapOrderCreationContext.needsApproval` and `twapOrderCreationContext.needsZeroApproval` refer to the
  // connected wallet (EOA/Safe), not to the proxy account. DO NO USE THEM HERE.

  const { composableCowContract, spender, currentBlockFactoryAddress } = twapOrderCreationContext

  if (!currentBlockFactoryAddress) {
    throw new Error('currentBlockFactoryAddress is required to create a TWAP order')
  }

  const { needsApproval, needsZeroApproval } = proxyAllowances

  console.log("EOA approvals", twapOrderCreationContext.needsApproval, twapOrderCreationContext.needsZeroApproval);
  console.log("Proxy approvals", { needsApproval, needsZeroApproval });

  const { sellAmount } = twapOrder
  const sellTokenAddress = sellAmount.currency.address
  const sellAmountAtoms = maxUint256

  // At the very lest, we need the create order tx:
  const txs: ICoWShedCall[] = [{
    target: composableCowContract.address,
      callData: getCreateTwapOrderCalldata({
      composableCowContractAbi: composableCowContract.abi,
      paramsStruct,
      currentBlockFactoryAddress,
    }),
    value: 0n,
    isDelegateCall: false,
    allowFailure: true,
  }]

  if (needsApproval) {
    // If we need to approve the sell token, we need to add the approve tx first:
    const approveTx: ICoWShedCall = {
      target: sellTokenAddress,
      callData: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as `0x${string}`, sellAmountAtoms],
      }),
      value: 0n,
      isDelegateCall: false,
      allowFailure: true,
    }

    txs.unshift(approveTx)
  }

  if (needsZeroApproval) {
    // Some USDT-style tokens require resetting the allowance to zero before we set a new allowance:
    const zeroApproveTx: ICoWShedCall = {
      target: sellTokenAddress,
      callData: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as `0x${string}`, 0n],
      }),
      value: 0n,
      isDelegateCall: false,
      allowFailure: true,
    }

    txs.unshift(zeroApproveTx)
  }

  return txs
}


export const jsonReplacer = (key: string, value: any) => {
  // Handle BigInt
  if (typeof value === "bigint") {
    return value.toString();
  }
  // Handle BigNumber (if you're using ethers.BigNumber)
  if (value?._isBigNumber) {
    return value.toString();
  }
  return value;
};

export function printQuote(quoteResults: QuoteResults) {
  console.log(`\n📉 Suggested slippage: ${quoteResults.suggestedSlippageBps}`);

  console.log(
    "\n🤝 Quote: ",
    JSON.stringify(quoteResults.quoteResponse, jsonReplacer, 2)
  );
  console.log(
    "\n💰 Amounts and costs: ",
    JSON.stringify(quoteResults.amountsAndCosts, jsonReplacer, 2)
  );
  console.log(
    "\n💿 App Data: ",
    JSON.stringify(quoteResults.appDataInfo, jsonReplacer, 2)
  );

  console.log(
    "\n✍️ Order to sign: ",
    JSON.stringify(quoteResults.orderToSign, jsonReplacer, 2)
  );

  console.log(
    "\n📝 Order Typed Data: ",
    JSON.stringify(quoteResults.orderTypedData, jsonReplacer, 2)
  );
}
