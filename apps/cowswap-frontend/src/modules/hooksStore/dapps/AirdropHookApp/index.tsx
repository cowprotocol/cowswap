import { useCallback } from 'react'

import { COW } from '@cowprotocol/common-const'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { useGasLimit } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary } from '@cowprotocol/ui'
import { Token } from '@uniswap/sdk-core'

import { HookDappProps } from 'modules/hooksStore/types/hooks'

import { AIRDROP_PREVIEW_ERRORS, useClaimData } from './hooks/useClaimData'
import { ClaimableAmountContainer, ContentWrapper, Row, Wrapper } from './styled'
import { IAirdrop, IClaimData } from './types'

const cowSepolia = COW[SupportedChainId.SEPOLIA]
const COW_AIRDROP = {
  name: 'COW',
  dataBaseUrl: 'https://raw.githubusercontent.com/bleu/cow-airdrop-contract-deployer/example/mock-airdrop-data/',
  chainId: SupportedChainId.SEPOLIA,
  address: '0xD1fB81659c434DDebC8468713E482134be0D85C0',
  token: TokenWithLogo.fromToken(
    new Token(cowSepolia.chainId, cowSepolia.address, cowSepolia.decimals, cowSepolia.symbol, cowSepolia.name),
    cowSepolia.logoURI,
  ),
} as IAirdrop

export function AirdropHookApp({ context }: HookDappProps) {
  const { data: claimData, isValidating, error } = useClaimData(COW_AIRDROP)
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

  return (
    <Wrapper>
      <ContentWrapper>
        <Row>
          <ClaimableAmountContainer>
            <span>Total Available to claim</span>
            <span>{claimData?.formattedAmount}</span>
          </ClaimableAmountContainer>
        </Row>
      </ContentWrapper>
      <ButtonPrimary disabled={!canClaim || isValidating} onClick={clickOnAddHook}>
        <ButtonPrimaryMessage
          account={context.account}
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
  claimData,
  error,
  isValidating,
}: {
  account?: string | undefined
  selectedAirdrop?: IAirdrop
  claimData?: IClaimData
  error?: Error
  isValidating?: boolean
}) {
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
