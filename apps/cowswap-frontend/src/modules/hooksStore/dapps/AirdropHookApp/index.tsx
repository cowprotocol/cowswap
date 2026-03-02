import { useCallback } from 'react'

import { COW_TOKEN_TO_CHAIN } from '@cowprotocol/common-const'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { useGasLimit } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary } from '@cowprotocol/ui'
import { Token } from '@uniswap/sdk-core'

import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react/macro'

import { HookDappProps } from 'modules/hooksStore/types/hooks'

import { AIRDROP_PREVIEW_ERRORS, useClaimData } from './hooks/useClaimData'
import { Amount, ContentWrapper, Label, Wrapper } from './styled'
import { IAirdrop, IClaimData } from './types'

const cowSepolia = COW_TOKEN_TO_CHAIN[SupportedChainId.SEPOLIA]
const COW_AIRDROP = {
  name: 'COW',
  dataBaseUrl: 'https://raw.githubusercontent.com/bleu/cow-airdrop-contract-deployer/example/mock-airdrop-data/',
  chainId: SupportedChainId.SEPOLIA,
  address: '0x06Ca512F7d35A35Dfa49aa69F12cFB2a9166a95b',
  token: cowSepolia
    ? TokenWithLogo.fromToken(
        new Token(cowSepolia.chainId, cowSepolia.address, cowSepolia.decimals, cowSepolia.symbol, cowSepolia.name),
        cowSepolia.logoURI,
      )
    : undefined,
} as IAirdrop

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function AirdropHookApp({ context }: HookDappProps) {
  const { data: claimData, isValidating, error } = useClaimData(COW_AIRDROP)
  const { data: gasLimit } = useGasLimit({ to: claimData?.contractAddress, data: claimData?.callData })

  const clickOnAddHook = useCallback(async () => {
    if (!context || !claimData || !gasLimit) return
    context.addHook({
      hook: {
        target: claimData.contractAddress,
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
        target: claimData.contractAddress,
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
            <Label>
              <Trans>Claimable amount</Trans>
            </Label>
            :<Amount>{claimData?.formattedAmount}</Amount>
          </div>
        ) : (
          messageToUser
        )}
      </ContentWrapper>
      {context.hookToEdit ? (
        <ButtonPrimary onClick={onEditHook}>
          <Trans>Return to Swap</Trans>
        </ButtonPrimary>
      ) : messageToUser === null ? (
        <ButtonPrimary disabled={!canClaim || isValidating} onClick={clickOnAddHook}>
          <Trans>Add Hook</Trans>
        </ButtonPrimary>
      ) : undefined}
    </Wrapper>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
    return (
      <span>
        <Trans>Connect your wallet</Trans>
      </span>
    )
  }

  if (isValidating) {
    return (
      <span>
        <Trans>Loading...</Trans>
      </span>
    )
  }

  if (error) {
    if (
      Object.values(AIRDROP_PREVIEW_ERRORS)
        .map((item) => i18n._(item))
        .includes(error.message)
    ) {
      return <span>{error.message}</span>
    } else {
      return (
        <span>
          <Trans>An unexpected error occurred</Trans>
        </span>
      )
    }
  }

  if (claimData?.isClaimed) {
    return (
      <span>
        <Trans>You have already claimed this airdrop</Trans>
      </span>
    )
  }

  return null
}
