import { useCallback, useState } from 'react'

import { formatTokenAmount } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'
import { Fraction } from '@uniswap/sdk-core'

import { useGasLimit } from 'modules/hooksStore/hooks/useGasLimitHooks'
import { HookDappProps } from 'modules/hooksStore/types/hooks'

import { AIRDROP_OPTIONS } from './constants'
import { useClaimData } from './hooks/useClaimData'
import { ClaimableAmountContainer } from './styled/ClaimableAmountContainer'
import { ContentWrapper } from './styled/ContentWrapper'
import { DropDownMenu } from './styled/DropDown'
import { Row } from './styled/Row'
import { Wrapper } from './styled/Wrapper'
import { AirdropOption, IClaimData } from './types'

export function AirdropHookApp({ context }: HookDappProps) {
  const [selectedAirdrop, setSelectedAirdrop] = useState<AirdropOption>()
  const { data: claimData, isValidating, error } = useClaimData(selectedAirdrop)
  const gasLimit = useGasLimit(claimData?.contract.address, claimData?.callData)

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

  return (
    <Wrapper>
      <ContentWrapper>
        <Row>
          <label style={{ width: 'fit-content', fontWeight: '600', fontSize: '10pt' }}>Select Airdrop</label>
          <DropDownMenu airdropOptions={AIRDROP_OPTIONS} setSelectedAirdrop={setSelectedAirdrop} />
        </Row>
        <Row>
          {claimData?.amount ? (
            <ClaimableAmountContainer>
              <span>Total Available to claim</span>
              <span>
                {formatTokenAmount(new Fraction(claimData.amount, 10 ** claimData.token.decimals))}{' '}
                {claimData?.token.symbol}
              </span>
            </ClaimableAmountContainer>
          ) : undefined}
        </Row>
      </ContentWrapper>
      <ButtonPrimary disabled={!canClaim || isValidating} onClick={clickOnAddHook}>
        <ButtonPrimaryMessage
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
  account,
  selectedAirdrop,
  claimData,
  error,
  isValidating,
}: {
  account?: string | undefined
  selectedAirdrop?: AirdropOption
  claimData?: IClaimData
  error?: Error
  isValidating?: boolean
}) {
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
    return <span>There was an unexpected error</span>
  }

  if (!claimData?.amount) {
    return <span>You are not eligible for this airdrop</span>
  }

  if (claimData.isClaimed) {
    return <span>You have already claimed this airdrop`</span>
  }

  return <span>Add pre-hook</span>
}
