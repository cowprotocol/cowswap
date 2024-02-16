import { Command } from '@cowprotocol/types'
import { ButtonEmpty, ButtonPrimary, Loader } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { ThemedText } from 'legacy/theme'

const PendingSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
  & > * {
    width: 100%;
  }
`

const LoaderContainer = styled.div`
  margin: 16px 0;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
`

const LoadingMessage = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  border-radius: 12px;

  & > * {
    padding: 1rem;
  }
`

const ErrorGroup = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: flex-start;
`

const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
`

const WalletError = styled.div`
  width: 100%;
  padding: 1rem;
  text-align: center;
  border-radius: 12px;
  background: ${({ theme }) => transparentize(theme.disabled, 0.7)};
  margin: -15px 0 20px 0;
`
export function PendingView({
  error,
  tryConnection,
  openOptions,
}: {
  error: string | undefined
  tryConnection: Command
  openOptions: Command
}) {
  return (
    <PendingSection>
      <LoadingMessage>
        <LoadingWrapper>
          {error ? (
            <ErrorGroup>
              <ThemedText.MediumHeader marginBottom={12}>
                <Trans>Error connecting</Trans>
              </ThemedText.MediumHeader>
              <ThemedText.Body fontSize={14} marginBottom={36} textAlign="center">
                <Trans>
                  The connection attempt failed. Please click try again and follow the steps to connect in your wallet.
                </Trans>
              </ThemedText.Body>
              <WalletError>
                <span>{error}</span>
              </WalletError>
              <ButtonPrimary $borderRadius="12px" padding="12px" onClick={tryConnection}>
                <Trans>Try Again</Trans>
              </ButtonPrimary>
              <ButtonEmpty width="fit-content" padding="0" marginTop={20}>
                <ThemedText.Link fontSize={12} onClick={openOptions}>
                  <Trans>Back to wallet selection</Trans>
                </ThemedText.Link>
              </ButtonEmpty>
            </ErrorGroup>
          ) : (
            <ThemedText.Black fontSize={20} marginY={16}>
              <LoaderContainer>
                <Loader stroke="currentColor" size="32px" />
              </LoaderContainer>
              <Trans>Connecting...</Trans>
            </ThemedText.Black>
          )}
        </LoadingWrapper>
      </LoadingMessage>
    </PendingSection>
  )
}
