import { useCallback } from 'react'

import { COW } from '@cowprotocol/common-const'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { useGasLimit } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary } from '@cowprotocol/ui'
import { Token } from '@uniswap/sdk-core'

import { HookDappProps } from 'modules/hooksStore/types/hooks'

import { AIRDROP_PREVIEW_ERRORS, useClaimData } from './hooks/useClaimData'
import { Amount, ContentWrapper, Label, Wrapper } from './styled'
import { IAirdrop, IClaimData } from './types'

const cowSepolia = COW[SupportedChainId.SEPOLIA]
const COW_AIRDROP = {
  name: 'COW',
  dataBaseUrl: 'https://raw.githubusercontent.com/bleu/cow-airdrop-contract-deployer/example/mock-airdrop-data/',
  chainId: SupportedChainId.SEPOLIA,
  address: '0x0D6361f70f54b0e63A34D3F2D2C2552a21F100Fc',
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

  const messageToUser = getMessageToUser({ account: context.account, claimData, error, isValidating })

  const onEditHook = useCallback(() => {
    if (!context.hookToEdit || !claimData || !gasLimit) return

    context.editHook({
      ...context.hookToEdit,
      hook: {
        target: claimData.contract.address,
        callData: claimData.callData,
        gasLimit,
      },
    })
  }, [context, claimData, gasLimit])

  return (
    <Wrapper>
      <ContentWrapper>
        {messageToUser === null ? (
          <div>
            <Label>Claimable amount</Label>:<Amount>{claimData?.formattedAmount}</Amount>
          </div>
        ) : (
          messageToUser
        )}
      </ContentWrapper>
      {context.hookToEdit ? (
        <ButtonPrimary onClick={onEditHook}>Return to Swap</ButtonPrimary>
      ) : messageToUser === null ? (
        <ButtonPrimary disabled={!canClaim || isValidating} onClick={clickOnAddHook}>
          Add Hook
        </ButtonPrimary>
      ) : undefined}
    </Wrapper>
  )
}

function getMessageToUser({
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
    return <span>You have already claimed this airdrop</span>
  }

  return null
}
