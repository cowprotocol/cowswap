import { ICoWShedCall } from '@cowprotocol/sdk-cow-shed'
import { defaultAbiCoder } from '@ethersproject/abi'
import { pack } from '@ethersproject/solidity'

import { toKeccak256 } from 'common/utils/toKeccak256'

const fnSelector = (sig: string): string => toKeccak256(sig).slice(0, 10)

const fnCalldata = (sig: string, encodedData: string): string =>
  pack(['bytes4', 'bytes'], [fnSelector(sig), encodedData])

interface RefoverFundsCallParams {
  account: string
  isNativeToken: boolean
  tokenBalance: string
  proxyAddress: string
  selectedTokenAddress: string
}

export function getRecoverFundsCalls({
  account,
  proxyAddress,
  selectedTokenAddress,
  tokenBalance,
  isNativeToken,
}: RefoverFundsCallParams): ICoWShedCall[] {
  return isNativeToken
    ? [
        {
          target: account,
          callData: fnCalldata('send(uint256)', defaultAbiCoder.encode(['uint256'], [tokenBalance])),
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
            defaultAbiCoder.encode(['address', 'uint256'], [proxyAddress, tokenBalance]),
          ),
          value: 0n,
          isDelegateCall: false,
          allowFailure: false,
        },
        {
          target: selectedTokenAddress,
          callData: fnCalldata(
            'transferFrom(address,address,uint256)',
            defaultAbiCoder.encode(['address', 'address', 'uint256'], [proxyAddress, account, tokenBalance]),
          ),
          value: 0n,
          isDelegateCall: false,
          allowFailure: false,
        },
      ]
}
