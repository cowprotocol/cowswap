import { Command } from '@cowprotocol/types'
import { ButtonEmpty, ButtonPrimary, Loader } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

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
  padding: 16px;
  text-align: center;
  border-radius: 12px;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  margin: -15px 0 20px 0;
`
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
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
              <ButtonPrimary
                $borderRadius="12px"
                padding="12px"
                onClick={tryConnection}
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.WALLET,
                  action: 'Try connection again',
                  label: error,
                })}
              >
                <Trans>Try Again</Trans>
              </ButtonPrimary>
              <ButtonEmpty width="fit-content" padding="0" marginTop={20}>
                <ThemedText.Link
                  fontSize={12}
                  onClick={openOptions}
                  data-click-event={toCowSwapGtmEvent({
                    category: CowSwapAnalyticsCategory.WALLET,
                    action: 'Back to wallet selection',
                  })}
                >
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
