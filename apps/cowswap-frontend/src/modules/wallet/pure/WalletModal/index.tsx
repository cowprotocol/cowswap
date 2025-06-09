import { Command } from '@cowprotocol/types'
import { AutoRow } from '@cowprotocol/ui'
import { TryActivation } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import { ThemedText } from 'theme'

import { LightCard } from 'legacy/components/Card'
import { AutoColumn } from 'legacy/components/Column'

import { CloseIcon, ContentWrapper, CowModal, HeaderRow, HoverText } from 'common/pure/Modal'

import { CloseColor, OptionGrid, TermsWrapper, UpperSection, Wrapper } from './styled'

import { ConnectWalletOptions } from '../../containers/ConnectWalletOptions'
import { PendingView } from '../PendingView'

export type WalletModalView = 'options' | 'account' | 'pending'

interface WalletModalProps {
  isOpen: boolean
  onDismiss: Command
  view: WalletModalView
  openOptions: Command
  tryConnection: Command
  pendingError: string | undefined
  tryActivation: TryActivation
  account: string | undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WalletModal(props: Readonly<WalletModalProps>) {
  const { isOpen, onDismiss, view, openOptions, pendingError, tryActivation, tryConnection } = props

  const isPending = view === 'pending'

  return (
    <CowModal maxWidth={600} isOpen={isOpen} onDismiss={onDismiss} minHeight={false} maxHeight={90}>
      <Wrapper>
        <UpperSection>
          {!isPending && (
            <HeaderRow>
              <HoverText>
                <Trans>Connect a wallet</Trans>
              </HoverText>

              <CloseIcon onClick={onDismiss}>
                <CloseColor />
              </CloseIcon>
            </HeaderRow>
          )}
          <ContentWrapper>
            <AutoColumn gap="16px">
              {isPending && (
                <PendingView openOptions={openOptions} error={pendingError} tryConnection={tryConnection} />
              )}
              {!isPending && (
                <ConnectWalletOptions tryActivation={tryActivation}>
                  {(content, count) => (
                    <OptionGrid data-testid="option-grid" itemsCount={count}>
                      {content}
                    </OptionGrid>
                  )}
                </ConnectWalletOptions>
              )}
              {!pendingError && (
                <LightCard>
                  <AutoRow style={{ flexWrap: 'nowrap' }}>
                    <ThemedText.Body fontSize={12}>
                      <CustomTerms />
                    </ThemedText.Body>
                  </AutoRow>
                </LightCard>
              )}
            </AutoColumn>
          </ContentWrapper>
        </UpperSection>
      </Wrapper>
    </CowModal>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function CustomTerms() {
  return (
    <TermsWrapper>
      <Trans>
        By connecting a wallet, you acknowledge that you have read, understood and agree to the interface’s{' '}
        <a
          href="https://cow.fi/legal/cowswap-terms?utm_source=swap.cow.fi&utm_medium=web&utm_content=wallet-modal-terms-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms &amp; Conditions
        </a>
        .
      </Trans>
    </TermsWrapper>
  )
}
