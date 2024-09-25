import { useCallback, useEffect, useMemo, useState } from 'react'

import { ButtonPrimary } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'

import { formatUnits } from 'ethers/lib/utils'

import { SBC_DEPOSIT_CONTRACT_ADDRESS } from './const'
import { useSBCDepositContract } from './useSBCDepositContract'

import { HookDappProps } from '../../types/hooks'
import { ContentWrapper, Text, LoadingLabel, Wrapper } from '../styled'

/**
 * Dapp that creates the hook to the connected wallet GNO Rewards.
 *
 * Creates the call-data for invoking claimWithdrawal from SBCDepositContractProxy
 *    - Proxy: 0x0B98057eA310F4d31F2a452B414647007d1645d9 (https://gnosisscan.io/address/0x0B98057eA310F4d31F2a452B414647007d1645d9#readProxyContract)
 *    - Master: 0x4fef25519256e24a1fc536f7677152da742fe3ef
 */
export function ClaimGnoHookApp({ context }: HookDappProps) {
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

    if (context.hookToEdit) {
      context.editHook({
        ...context.hookToEdit,
        hook: {
          callData,
          gasLimit: gasLimit.toString(),
          target: SBC_DEPOSIT_CONTRACT_ADDRESS,
        },
      })
    } else {
      context.addHook({
        hook: {
          callData,
          gasLimit: gasLimit.toString(),
          target: SBC_DEPOSIT_CONTRACT_ADDRESS,
        },
      })
    }
  }, [callData, gasLimit, context, claimable])

  return (
    <Wrapper>
      <ContentWrapper>
        {!SbcDepositContractInterface ? (
          'Unsupported network. Please change to Gnosis Chain'
        ) : !context?.account ? (
          'Connect your wallet first'
        ) : (
          <>
            <ClaimableAmount loading={loading} claimable={claimable} error={error} />
          </>
        )}
      </ContentWrapper>
      {claimable && !error && (
        <ButtonPrimary onClick={clickOnAddHook}>
          {context.hookToEdit ? 'Update Pre-hook' : 'Add Pre-hook'}
        </ButtonPrimary>
      )}
    </Wrapper>
  )
}

function ClaimableAmount(props: { loading: boolean; error: boolean; claimable: BigNumber | undefined }) {
  const { loading, error, claimable } = props
  if (error) {
    return <Text color={`var(${UI.COLOR_DANGER})`}>Error loading the claimable amount</Text>
  }

  if (loading || !claimable) {
    return <LoadingLabel>Loading...</LoadingLabel>
  }

  return (
    <>
      <Text color={`var(${UI.COLOR_TEXT_OPACITY_70})`}>Total claimable rewards:</Text>
      <Text fontSize="36px" fontWeight="bold">
        {formatUnits(claimable, 18)} GNO
      </Text>
    </>
  )
}
