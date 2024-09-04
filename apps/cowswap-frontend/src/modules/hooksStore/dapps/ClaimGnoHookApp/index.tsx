import { useCallback, useEffect, useMemo, useState } from 'react'

import gnoLogo from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'
import { GNO } from '@cowprotocol/common-const'
import { HookDappProps } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { formatUnits } from 'ethers/lib/utils'

import { SBC_DEPOSIT_CONTRACT_ADDRESS } from './const'
import { Amount, ContentWrapper, ErrorLabel, Header, Label, Link, LoadingLabel, Wrapper } from './styled'
import { useSBCDepositContract } from './useSBCDepositContract'

/**
 * Dapp that creates the hook to the connected wallet GNO Rewards.
 *
 * Creates the call-data for invoking claimWithdrawal from SBCDepositContractProxy
 *    - Proxy: 0x0B98057eA310F4d31F2a452B414647007d1645d9 (https://gnosisscan.io/address/0x0B98057eA310F4d31F2a452B414647007d1645d9#readProxyContract)
 *    - Master: 0x4fef25519256e24a1fc536f7677152da742fe3ef
 */
export function ClaimGnoHookApp({ dapp, context }: HookDappProps) {
  const SbcDepositContract = useSBCDepositContract()
  const [claimable, setClaimable] = useState<BigNumber | undefined>(undefined)
  const [gasLimit, setGasLimit] = useState<BigNumber | undefined>(undefined)
  const [error, setError] = useState<boolean>(false)

  const loading = (!gasLimit || !claimable) && !error

  const SbcDepositContractInterface = SbcDepositContract?.interface
  const callData = useMemo(() => {
    if (!SbcDepositContractInterface || !context?.account) {
      return null
    }

    return SbcDepositContractInterface.encodeFunctionData('claimWithdrawal', [context.account])
  }, [SbcDepositContractInterface, context])

  useEffect(() => {
    if (!SbcDepositContract || !context?.account) {
      return
    }
    const handleError = (e: any) => {
      console.error('[ClaimGnoHookApp] Error getting balance/gasEstimation', e)
      setError(true)
    }

    // Get balance
    SbcDepositContract.withdrawableAmount(context.account)
      .then((claimable) => {
        console.log('[ClaimGnoHookApp] get claimable', claimable)
        setClaimable(claimable)
      })
      .catch(handleError)

    // Get gas estimation
    SbcDepositContract.estimateGas.claimWithdrawal(context.account).then(setGasLimit).catch(handleError)
  }, [SbcDepositContract, setClaimable, context])

  const clickOnAddHook = useCallback(() => {
    if (!callData || !gasLimit || !context || !claimable) {
      return
    }

    const gno = GNO[context.chainId]
    context.addHook({
      hook: {
        callData,
        gasLimit: gasLimit.toString(),
        target: SBC_DEPOSIT_CONTRACT_ADDRESS,
      },
      outputTokens: [CurrencyAmount.fromRawAmount(gno, claimable.toString())],
    })
  }, [callData, gasLimit, context, claimable])

  if (!SbcDepositContractInterface) {
    return 'Unsupported network. Please change to Gnosis Chain'
  }

  if (!context?.account) {
    return 'Connect your wallet first'
  }

  return (
    <Wrapper>
      <Header>
        <img src={gnoLogo} alt={dapp.name} width="60" />
        <p>{dapp.description}</p>
      </Header>
      <ContentWrapper>
        <ClaimableAmount loading={loading} claimable={claimable} error={error} />
      </ContentWrapper>
      {claimable && !error && <ButtonPrimary onClick={clickOnAddHook}>+Add Pre-hook</ButtonPrimary>}
      <Link
        onClick={(e) => {
          e.preventDefault()
          context.close()
        }}
      >
        Close
      </Link>
    </Wrapper>
  )
}

function ClaimableAmount(props: { loading: boolean; error: boolean; claimable: BigNumber | undefined }) {
  const { loading, error, claimable } = props
  if (error) {
    return <ErrorLabel>Error loading the claimable amount</ErrorLabel>
  }

  if (loading || !claimable) {
    return <LoadingLabel>Loading...</LoadingLabel>
  }

  return (
    <>
      <div>
        <Label>Total claimable rewards</Label>:
      </div>
      <Amount>{formatUnits(claimable, 18)} GNO</Amount>
    </>
  )
}
