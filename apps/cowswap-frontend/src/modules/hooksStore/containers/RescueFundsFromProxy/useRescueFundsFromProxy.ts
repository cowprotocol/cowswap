import { useCallback, useMemo, useState } from 'react'

import { CowShedContract, CowShedContractAbi } from '@cowprotocol/abis'
import { SigningScheme } from '@cowprotocol/contracts'
import { COW_SHED_FACTORY, ICoWShedCall } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from '@ethersproject/keccak256'
import { pack } from '@ethersproject/solidity'
import { formatBytes32String, toUtf8Bytes } from '@ethersproject/strings'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useContract } from 'common/hooks/useContract'
import { useCowShedHooks } from 'common/hooks/useCowShedHooks'

const fnSelector = (sig: string) => keccak256(toUtf8Bytes(sig)).slice(0, 10)

const fnCalldata = (sig: string, encodedData: string) => pack(['bytes4', 'bytes'], [fnSelector(sig), encodedData])

export function useRescueFundsFromProxy(
  selectedTokenAddress: string | undefined,
  tokenBalance: CurrencyAmount<Currency> | null,
) {
  const [isTxSigningInProgress, setTxSigningInProgress] = useState<boolean>(false)

  const provider = useWalletProvider()
  const { account } = useWalletInfo()
  const cowShedHooks = useCowShedHooks()
  const cowShedContract = useContract<CowShedContract>(COW_SHED_FACTORY, CowShedContractAbi)

  const proxyAddress = useMemo(() => {
    if (!account || !cowShedHooks) return

    return cowShedHooks.proxyOf(account)
  }, [account, cowShedHooks])

  const callback = useCallback(async () => {
    if (
      !cowShedHooks ||
      !provider ||
      !proxyAddress ||
      !cowShedContract ||
      !selectedTokenAddress ||
      !account ||
      !tokenBalance
    )
      return

    setTxSigningInProgress(true)

    try {
      const calls: ICoWShedCall[] = [
        {
          target: selectedTokenAddress,
          callData: fnCalldata(
            'approve(address,uint256)',
            defaultAbiCoder.encode(['address', 'uint256'], [proxyAddress, tokenBalance.quotient.toString()]),
          ),
          value: 0n,
          isDelegateCall: false,
          allowFailure: false,
        },
        {
          target: selectedTokenAddress,
          callData: fnCalldata(
            'transferFrom(address,address,uint256)',
            defaultAbiCoder.encode(
              ['address', 'address', 'uint256'],
              [proxyAddress, account, tokenBalance.quotient.toString()],
            ),
          ),
          value: 0n,
          isDelegateCall: false,
          allowFailure: false,
        },
      ]

      const nonce = formatBytes32String(Date.now().toString())
      // This field is supposed to be used with orders, but here we just do a transaction
      const validTo = 99999999999

      const encodedSignature = await cowShedHooks.signCalls(
        calls,
        nonce,
        BigInt(validTo),
        provider.getSigner(),
        SigningScheme.EIP712,
      )

      const transaction = await cowShedContract.executeHooks(calls, nonce, BigInt(validTo), account, encodedSignature, {
        gasLimit: 600_000,
      })

      return transaction.hash
    } finally {
      setTxSigningInProgress(false)
    }
  }, [provider, proxyAddress, cowShedContract, selectedTokenAddress, account, tokenBalance, cowShedHooks])

  return { callback, isTxSigningInProgress, proxyAddress }
}
