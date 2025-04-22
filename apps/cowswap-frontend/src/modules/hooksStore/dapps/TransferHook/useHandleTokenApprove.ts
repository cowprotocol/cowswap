import { useCallback } from 'react'

import { Erc20Abi } from '@cowprotocol/abis'

import { encodeFunctionData, maxUint256, type Address } from 'viem'

import type { Signer } from 'ethers'

export function useHandleTokenMaxApprove({
  signer,
  spender,
}: {
  signer: Signer | undefined
  spender: Address | undefined
}) {
  return useCallback(
    async (tokenAddress: Address) => {
      handleTokenApprove({
        signer,
        spender,
        tokenAddress,
        amount: maxUint256,
      })
    },
    [signer, spender],
  )
}

export async function handleTokenApprove({
  signer,
  spender,
  tokenAddress,
  amount,
}: {
  signer: Signer | undefined
  spender: Address | undefined
  tokenAddress: Address
  amount: bigint
}) {
  if (!signer || !spender) {
    throw new Error('Missing context')
  }

  // add encodeFunctionData
  const data = encodeFunctionData({
    abi: Erc20Abi,
    functionName: 'approve',
    args: [spender, amount],
  })

  const transaction = await signer
    .sendTransaction({
      to: tokenAddress,
      value: '0',
      data,
    })
    .catch(() => {
      throw new Error('User rejected transaction')
    })

  const receipt = await transaction.wait()

  return receipt
}
