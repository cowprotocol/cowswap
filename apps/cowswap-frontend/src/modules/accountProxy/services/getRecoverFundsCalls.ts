import { ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

import { encodePacked, encodeAbiParameters, type Hex } from 'viem'

import { toKeccak256 } from 'common/utils/toKeccak256'

const fnSelector = (sig: string): Hex => toKeccak256(sig).slice(0, 10) as Hex

const fnCalldata = (sig: string, encodedData: Hex): Hex =>
  encodePacked(['bytes4', 'bytes'], [fnSelector(sig), encodedData])

interface RefoverFundsCallParams {
  account: string
  isNativeToken: boolean
  tokenBalance: string
  proxyAddress: string
  selectedTokenAddress: string
}

type CoWShedCall = ICoWShedCall & {
  callData: Hex
}

export function getRecoverFundsCalls({
  account,
  proxyAddress,
  selectedTokenAddress,
  tokenBalance,
  isNativeToken,
}: RefoverFundsCallParams): CoWShedCall[] {
  const tokenBalanceBigInt = BigInt(tokenBalance)
  return isNativeToken
    ? [
        {
          target: account,
          callData: fnCalldata('send(uint256)', encodeAbiParameters([{ type: 'uint256' }], [tokenBalanceBigInt])),
          value: BigInt(tokenBalance),
          isDelegateCall: false,
          allowFailure: false,
        },
      ]
    : [
        {
          target: selectedTokenAddress,
          callData: fnCalldata(
            'approve(address,uint256)',
            encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], [proxyAddress, tokenBalanceBigInt]),
          ),
          value: 0n,
          isDelegateCall: false,
          allowFailure: false,
        },
        {
          target: selectedTokenAddress,
          callData: fnCalldata(
            'transferFrom(address,address,uint256)',
            encodeAbiParameters(
              [{ type: 'address' }, { type: 'address' }, { type: 'uint256' }],
              [proxyAddress, account, tokenBalanceBigInt],
            ),
          ),
          value: 0n,
          isDelegateCall: false,
          allowFailure: false,
        },
      ]
}
