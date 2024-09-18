import { useCallback, useState } from 'react'

import { ButtonPrimary } from '@cowprotocol/ui'

import { useGasLimit } from 'modules/hooksStore/hooks/useGasLimitHooks'
import { HookDappProps } from 'modules/hooksStore/types/hooks'

import { AIRDROP_OPTIONS } from './constants'
import { AIRDROP_PREVIEW_ERRORS, useClaimData } from './hooks/useClaimData'
import { ClaimableAmountContainer, ContentWrapper, DropDownMenu, LabelContainer, Row, Wrapper } from './styled'
import { AirdropOption, IClaimData } from './types'

export function AirdropHookApp({ context }: HookDappProps) {
  const [selectedAirdrop, setSelectedAirdrop] = useState<AirdropOption>()
  const { data: claimData, isValidating, error } = useClaimData(selectedAirdrop)
  const { data: gasLimit } = useGasLimit({ to: claimData?.contract.address, data: claimData?.callData })

  const clickOnAddHook = useCallback(async () => {
    if (!context || !claimData || !gasLimit) return
    context.addHook({
      hook: {
        target: claimData.contract.address,
        callData: claimData.callData,
        gasLimit,
      },
    })
  }, [context, claimData, gasLimit])

  const canClaim = claimData?.amount && !claimData?.isClaimed

  const connectedChainAirdrops = AIRDROP_OPTIONS.filter((airdrop) => airdrop.chainId === context.chainId)

  return (
    <Wrapper>
      <ContentWrapper>
        <Row>
          <LabelContainer>
            <label>Select Airdrop</label>
          </LabelContainer>
          <DropDownMenu airdropOptions={connectedChainAirdrops} setSelectedAirdrop={setSelectedAirdrop} />
        </Row>
        <Row>
          <ClaimableAmountContainer>
            <span>Total Available to claim</span>
            <span>{claimData?.formattedAmount}</span>
          </ClaimableAmountContainer>
        </Row>
      </ContentWrapper>
      <ButtonPrimary disabled={!canClaim || isValidating} onClick={clickOnAddHook}>
        <ButtonPrimaryMessage
          connectedChainAirdrops={connectedChainAirdrops}
          account={context.account}
          selectedAirdrop={selectedAirdrop}
          claimData={claimData}
          error={error}
          isValidating={isValidating}
        />
      </ButtonPrimary>
    </Wrapper>
  )
}

function ButtonPrimaryMessage({
  connectedChainAirdrops,
  account,
  selectedAirdrop,
  claimData,
  error,
  isValidating,
}: {
  connectedChainAirdrops?: AirdropOption[]
  account?: string | undefined
  selectedAirdrop?: AirdropOption
  claimData?: IClaimData
  error?: Error
  isValidating?: boolean
}) {
  if (connectedChainAirdrops !== undefined && connectedChainAirdrops.length === 0) {
    return <span>There are no airdrops for the connected chain</span>
  }

  if (!selectedAirdrop) {
    return <span>Select your airdrop</span>
  }

  if (!account) {
    return <span>Connect your wallet</span>
  }

  if (isValidating) {
    return <span>Loading...</span>
  }

  if (error) {
    if (Object.values(AIRDROP_PREVIEW_ERRORS).includes(error.message)) {
      return <span>{error.message}</span>
    } else {
      return <span>An unexpected error occurred</span>
    }
  }

  if (claimData?.isClaimed) {
    return <span>You have already claimed this airdrop`</span>
  }

  return <span>Add pre-hook</span>
}
