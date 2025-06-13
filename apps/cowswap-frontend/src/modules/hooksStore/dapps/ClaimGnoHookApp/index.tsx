import { useCallback, useEffect, useMemo, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary, UI } from '@cowprotocol/ui'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { BigNumber } from '@ethersproject/bignumber'

import { formatUnits } from 'ethers/lib/utils'

import { SBC_DEPOSIT_CONTRACT_ADDRESS, SBCDepositContract } from './const'

import { HookDappProps } from '../../types/hooks'
import { ContentWrapper, LoadingLabel, Text, Wrapper } from '../styled'

const SbcDepositContractInterface = SBCDepositContract.interface

/**
 * Dapp that creates the hook to the connected wallet GNO Rewards.
 *
 * Creates the call-data for invoking claimWithdrawal from SBCDepositContractProxy
 *    - Proxy: 0x0B98057eA310F4d31F2a452B414647007d1645d9 (https://gnosisscan.io/address/0x0B98057eA310F4d31F2a452B414647007d1645d9#readProxyContract)
 *    - Master: 0x4fef25519256e24a1fc536f7677152da742fe3ef
 */
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function ClaimGnoHookApp({ context }: HookDappProps) {
  const provider = useWalletProvider()
  const [claimable, setClaimable] = useState<BigNumber | undefined>(undefined)
  const [gasLimit, setGasLimit] = useState<BigNumber | undefined>(undefined)
  const [error, setError] = useState<boolean>(false)

  const loading = (!gasLimit || !claimable) && !error

  const account = context?.account

  const callData = useMemo(() => {
    if (!account) {
      return null
    }

    return SbcDepositContractInterface.encodeFunctionData('claimWithdrawal', [account])
  }, [account])

  useEffect(() => {
    if (!account || !provider) {
      return
    }

    // TODO: Replace any with proper type definitions
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
    const handleError = (e: any) => {
      console.error('[ClaimGnoHookApp] Error getting balance/gasEstimation', e)
      setError(true)
    }

    // Get balance
    SBCDepositContract.connect(provider)
      .withdrawableAmount(account)
      .then((claimable) => {
        console.log('[ClaimGnoHookApp] get claimable', claimable)
        setClaimable(claimable)
      })
      .catch(handleError)

    SBCDepositContract.connect(provider).estimateGas.claimWithdrawal(account).then(setGasLimit).catch(handleError)
  }, [setClaimable, account, provider])

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
      <ContentWrapper minHeight={150}>
        {context.chainId !== SupportedChainId.GNOSIS_CHAIN ? (
          'Unsupported network. Please change to Gnosis Chain'
        ) : !account ? (
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
