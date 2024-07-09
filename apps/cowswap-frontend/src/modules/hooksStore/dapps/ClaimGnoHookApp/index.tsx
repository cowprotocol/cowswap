import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import gnoLogo from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'
import { GNO } from '@cowprotocol/common-const'
import { HookDappInternal, HookDappType } from '@cowprotocol/types'
import { ButtonPrimary, UI } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { formatUnits } from 'ethers/lib/utils'
import styled from 'styled-components/macro'

import { SBC_DEPOSIT_CONTRACT_ADDRESS } from '../../const'
import { HookDappContext } from '../../context'
import { useSBCDepositContract } from '../../hooks/useSBCDepositContract'

const TITLE = 'Claim GNO from validators'
const DESCRIPTION = 'Allows you to withdraw the rewards from your Gnosis validators.'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;

  flex-grow: 1;
`

const Link = styled.button`
  border: none;
  padding: 0;
  text-decoration: underline;
  display: text;
  cursor: pointer;
  background: none;
  color: white;
  margin: 10px 0;
`

const Header = styled.div`
  display: flex;
  padding: 1.5em;

  p {
    padding: 0 1em;
  }
`

const Label = styled.span`
  color: var(${UI.COLOR_TEXT2});
`

const ContentWrapper = styled.div`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 1em;
  text-align: center;
`

const Amount = styled.div`
  font-weight: 600;
  margin-top: 0.3em;
`

const ErrorLabel = styled.div`
  color: var(${UI.COLOR_RED});
`

const LoadingLabel = styled.div`
  color: var(${UI.COLOR_TEXT2});
`

export const PRE_CLAIM_GNO: HookDappInternal = {
  name: TITLE,
  description: DESCRIPTION,
  type: HookDappType.INTERNAL,
  path: '/hooks-dapps/pre/claim-gno',
  component: <ClaimGnoHookApp />,
  image: gnoLogo,
  version: 'v0.1.1',
}

/**
 * Dapp that creates the hook to the connected wallet GNO Rewards.
 *
 * Creates the call-data for invoking claimWithdrawal from SBCDepositContractProxy
 *    - Proxy: 0x0B98057eA310F4d31F2a452B414647007d1645d9 (https://gnosisscan.io/address/0x0B98057eA310F4d31F2a452B414647007d1645d9#readProxyContract)
 *    - Master: 0x4fef25519256e24a1fc536f7677152da742fe3ef
 */
export function ClaimGnoHookApp() {
  const hookDappContext = useContext(HookDappContext)
  const SbcDepositContract = useSBCDepositContract()
  const [claimable, setClaimable] = useState<BigNumber | undefined>(undefined)
  const [gasLimit, setGasLimit] = useState<BigNumber | undefined>(undefined)
  const [error, setError] = useState<boolean>(false)

  const loading = (!gasLimit || !claimable) && !error

  const SbcDepositContractInterface = SbcDepositContract?.interface
  const callData = useMemo(() => {
    if (!SbcDepositContractInterface || !hookDappContext?.account) {
      return null
    }

    return SbcDepositContractInterface.encodeFunctionData('claimWithdrawal', [hookDappContext.account])
  }, [SbcDepositContractInterface, hookDappContext])

  useEffect(() => {
    if (!SbcDepositContract || !hookDappContext?.account) {
      return
    }
    const handleError = (e: any) => {
      console.error('[ClaimGnoHookApp] Error getting balance/gasEstimation', e)
      setError(true)
    }

    // Get balance
    SbcDepositContract.withdrawableAmount(hookDappContext.account)
      .then((claimable) => {
        console.log('[ClaimGnoHookApp] get claimable', claimable)
        setClaimable(claimable)
      })
      .catch(handleError)

    // Get gas estimation
    SbcDepositContract.estimateGas.claimWithdrawal(hookDappContext.account).then(setGasLimit).catch(handleError)
  }, [SbcDepositContract, setClaimable, hookDappContext])

  const clickOnAddHook = useCallback(() => {
    if (!callData || !gasLimit || !hookDappContext || !claimable) {
      return
    }

    const gno = GNO[hookDappContext.chainId]
    hookDappContext.addHook(
      {
        hook: {
          callData,
          gasLimit: gasLimit.toString(),
          target: SBC_DEPOSIT_CONTRACT_ADDRESS,
        },
        dapp: PRE_CLAIM_GNO,
        outputTokens: [CurrencyAmount.fromRawAmount(gno, claimable.toString())],
      },
      true
    )
  }, [callData, gasLimit, hookDappContext, claimable])

  if (!SbcDepositContractInterface) {
    return 'Unsupported network. Please change to Gnosis Chain'
  }

  if (!hookDappContext?.account) {
    return 'Connect your wallet first'
  }

  if (!hookDappContext) {
    return 'Loading...'
  }

  return (
    <Wrapper>
      <Header>
        <img src={gnoLogo} alt={TITLE} width="60" />
        <p>{DESCRIPTION}</p>
      </Header>
      <ContentWrapper>
        <ClaimableAmount loading={loading} claimable={claimable} error={error} />
      </ContentWrapper>
      {claimable && !error && <ButtonPrimary onClick={clickOnAddHook}>+Add Pre-hook</ButtonPrimary>}
      <Link
        onClick={(e) => {
          e.preventDefault()
          hookDappContext.close()
        }}
      >
        Close
      </Link>
    </Wrapper>
  )
}

export function ClaimableAmount(props: { loading: boolean; error: boolean; claimable: BigNumber | undefined }) {
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
