import { useCallback, useMemo, useState } from 'react'

import { SigningScheme } from '@cowprotocol/contracts'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { BigNumber } from '@ethersproject/bignumber/src.ts/bignumber'
import { formatBytes32String, toUtf8Bytes } from '@ethersproject/strings'

import { useContract, useTokenContract } from 'common/hooks/useContract'
import { useCowShedHooks } from 'common/hooks/useCowShedHooks'

import { COW_SHED_FACTORY, ICoWShedCall } from '@cowprotocol/cow-sdk'
import { CowShedContract, CowShedContractAbi } from '@cowprotocol/abis'
import { defaultAbiCoder } from '@ethersproject/abi'
import { pack } from '@ethersproject/solidity'
import { keccak256 } from '@ethersproject/keccak256'

const fnSelector = (sig: string) => keccak256(toUtf8Bytes(sig)).slice(0, 10)

const fnCalldata = (sig: string, encodedData: string) => pack(['bytes4', 'bytes'], [fnSelector(sig), encodedData])

export function RescueFundsFromProxy() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenBalance, setTokenBalance] = useState<BigNumber | null>(null)

  const provider = useWalletProvider()
  const { account } = useWalletInfo()
  const cowShedHooks = useCowShedHooks()
  const erc20Contract = useTokenContract(tokenAddress)
  const cowShedContract = useContract<CowShedContract>(COW_SHED_FACTORY, CowShedContractAbi)

  const proxyAddress = useMemo(() => {
    if (!account || !cowShedHooks) return

    return cowShedHooks.proxyOf(account)
  }, [account, cowShedHooks])

  const checkProxyBalance = useCallback(() => {
    if (!erc20Contract || !proxyAddress) return

    erc20Contract.balanceOf(proxyAddress).then(setTokenBalance)
  }, [erc20Contract, proxyAddress])

  const rescueFunds = useCallback(async () => {
    if (!cowShedHooks || !provider || !proxyAddress || !cowShedContract || !tokenAddress || !account || !tokenBalance)
      return

    const calls: ICoWShedCall[] = [
      {
        target: tokenAddress,
        callData: fnCalldata(
          'transferFrom(address,address,uint256)',
          defaultAbiCoder.encode(
            ['address', 'address', 'uint256'],
            [proxyAddress, account, tokenBalance.toHexString()],
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

    const gasLimit = await cowShedContract.estimateGas.executeHooks(
      calls,
      nonce,
      BigInt(validTo),
      account,
      encodedSignature,
    )

    // TODO: handle errors
    const transaction = await cowShedContract.executeHooks(calls, nonce, BigInt(validTo), account, encodedSignature, {
      gasLimit,
    })

    console.log('Rescue funds transaction:', transaction)
  }, [provider, proxyAddress, cowShedContract, tokenAddress, account, tokenBalance])

  return (
    <div>
      <p>Proxy: {proxyAddress}</p>
      {tokenBalance ? (
        <>
          <p>Balance: {tokenBalance.toString()}</p>
          <button onClick={rescueFunds}>Rescue funds</button>
        </>
      ) : (
        <>
          <label>Token address</label>
          <input type="text" onChange={(e) => setTokenAddress(e.target.value)} />
          <br />
          <button onClick={checkProxyBalance}>Check</button>
        </>
      )}
    </div>
  )
}
