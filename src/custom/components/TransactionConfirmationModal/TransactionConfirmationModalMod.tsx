import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import Badge from 'components/Badge'
import { CHAIN_INFO } from 'constants/chainInfo'
import { L2_CHAIN_IDS /*, SupportedL2ChainId */ } from '@src/constants/chains'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
// import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import { ReactNode, useContext } from 'react'
import { AlertCircle, AlertTriangle /*, ArrowUpCircle, CheckCircle */ } from 'react-feather'
import { Text } from 'rebass'
import { useIsTransactionConfirmed, useTransaction } from 'state/transactions/hooks'
import styled, { ThemeContext } from 'styled-components/macro'

import Circle from 'assets/images/blue-loader.svg'
// import MetaMaskLogo from 'assets/images/metamask.png'
import { ExternalLink } from 'theme'
import { CloseIcon, CustomLightSpinner } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { TransactionSummary } from 'components/AccountDetails/TransactionSummary'
import { ButtonPrimary /*, ButtonLight */ } from '../Button'
import { AutoColumn, ColumnCenter } from 'components/Column'
// import Modal from 'components/Modal'
import { RowBetween, RowFixed } from 'components/Row'
import AnimatedConfirmation from 'components/TransactionConfirmationModal/AnimatedConfirmation'

// MOD imports
import { GpModal } from 'components/Modal'
import {
  ConfirmationPendingContent,
  ConfirmationModalContentProps,
  TransactionSubmittedContent,
  GPModalHeader,
  CloseIconWrapper,
  OperationType,
} from '.'
import { SupportedChainId } from 'constants/chains'

export const Wrapper = styled.div`
  width: 100%;
  padding: 1rem;
  /* -- mod -- */
  display: flex;
  flex-flow: column nowrap;
  overflow-y: auto;
  scrollbar-color: ${({ theme }) => `${theme.card.border} ${theme.card.background2}`};
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 14px;
    background: ${({ theme }) => `${theme.card.background2}`};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => `${theme.card.border}`};
    border: 3px solid transparent;
    border-radius: 14px;
    background-clip: padding-box;
  }

  &::-webkit-resizer,
  &::-webkit-scrollbar-button,
  &::-webkit-scrollbar-corner {
    height: 6px;
  }
  /* -- mod -- */
`
const Section = styled(AutoColumn)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '0' : '0')};
`

const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-bottom: 16px;
  `}/* -- mod -- */
`

const ConfirmedIcon = styled(ColumnCenter)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '20px 0' : '32px 0;')};
`

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`

/* export function ConfirmationPendingContent({
  onDismiss,
  pendingText,
  inline,
}: {
  onDismiss: () => void
  pendingText: ReactNode
  inline?: boolean // not in modal
}) {
  return (
    <Wrapper>
      <AutoColumn gap="md">
        {!inline && (
          <RowBetween>
            <div />
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          <CustomLightSpinner src={Circle} alt="loader" size={inline ? '40px' : '90px'} />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={500} fontSize={20} textAlign="center">
            <Trans>Waiting For Confirmation</Trans>
          </Text>
          <Text fontWeight={400} fontSize={16} textAlign="center">
            {pendingText}
          </Text>
          <Text fontWeight={500} fontSize={14} color="#565A69" textAlign="center" marginBottom="12px">
            <Trans>Confirm this transaction in your wallet</Trans>
          </Text>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  )
}
export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  inline,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: number
  currencyToAdd?: Currency | undefined
  inline?: boolean // not in modal
}) {
  const theme = useContext(ThemeContext)

  const { library } = useActiveWeb3React()

  const { addToken, success } = useAddTokenToMetamask(currencyToAdd)

  return (
    <Wrapper>
      <Section inline={inline}>
        {!inline && (
          <RowBetween>
            <div />
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          <ArrowUpCircle strokeWidth={0.5} size={inline ? '40px' : '90px'} color={theme.primary1} />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={500} fontSize={20} textAlign="center">
            <Trans>Transaction Submitted</Trans>
          </Text>
          {chainId && hash && (
            <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
              <Text fontWeight={500} fontSize={14} color={theme.primary1}>
                <Trans>View on Explorer</Trans>
              </Text>
            </ExternalLink>
          )}
          {currencyToAdd && library?.provider?.isMetaMask && (
            <ButtonLight mt="12px" padding="6px 12px" width="fit-content" onClick={addToken}>
              {!success ? (
                <RowFixed>
                  <Trans>
                    Add {currencyToAdd.symbol} to Metamask <StyledLogo src={MetaMaskLogo} />
                  </Trans>
                </RowFixed>
              ) : (
                <RowFixed>
                  <Trans>Added {currencyToAdd.symbol} </Trans>
                  <CheckCircle size={'16px'} stroke={theme.green1} style={{ marginLeft: '6px' }} />
                </RowFixed>
              )}
            </ButtonLight>
          )}
          <ButtonPrimary onClick={onDismiss} style={{ margin: '20px 0 0 0' }}>
            <Text fontWeight={500} fontSize={20}>
              {inline ? <Trans>Return</Trans> : <Trans>Close</Trans>}
            </Text>
          </ButtonPrimary>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
} */

export function ConfirmationModalContent({
  title,
  titleSize, // mod
  styles, // mod
  bottomContent,
  onDismiss,
  topContent,
}: ConfirmationModalContentProps) {
  /* {
  title: ReactNode
  onDismiss: () => void
  topContent: () => ReactNode
  bottomContent?: () => ReactNode | undefined
} */
  return (
    <Wrapper>
      <Section>
        {/* <RowBetween> */}
        <GPModalHeader>
          <Text
            fontWeight={500}
            fontSize={titleSize || 16} // MOD
            style={styles} //MOD
          >
            {title}
          </Text>
          {/* <CloseIcon onClick={onDismiss} /> */}
          <CloseIconWrapper onClick={onDismiss} /> {/* MOD */}
        </GPModalHeader>
        {/* </RowBetween> */}
        {topContent()}
      </Section>
      {bottomContent && <BottomSection gap="12px">{bottomContent()}</BottomSection>}
    </Wrapper>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: ReactNode; onDismiss: () => void }) {
  const theme = useContext(ThemeContext)
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            <Trans>Error</Trans>
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
          <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
          <Text
            fontWeight={500}
            fontSize={16}
            color={theme.red1}
            style={{ textAlign: 'center', width: '85%', wordBreak: 'break-word' }}
          >
            {message}
          </Text>
        </AutoColumn>
      </Section>
      <BottomSection gap="12px">
        <ButtonPrimary onClick={onDismiss}>
          <Trans>Dismiss</Trans>
        </ButtonPrimary>
      </BottomSection>
    </Wrapper>
  )
}

function L2Content({
  onDismiss,
  chainId,
  hash,
  pendingText,
  inline,
}: {
  onDismiss: () => void
  hash: string | undefined
  // chainId: number
  chainId: SupportedChainId
  currencyToAdd?: Currency | undefined
  pendingText: ReactNode
  inline?: boolean // not in modal
}) {
  const theme = useContext(ThemeContext)

  const transaction = useTransaction(hash)
  const confirmed = useIsTransactionConfirmed(hash)
  const transactionSuccess = transaction?.receipt?.status === 1

  // convert unix time difference to seconds
  const secondsToConfirm = transaction?.confirmedTime
    ? (transaction.confirmedTime - transaction.addedTime) / 1000
    : undefined

  const info = CHAIN_INFO[chainId /*  as SupportedL2ChainId */]

  return (
    <Wrapper>
      <Section inline={inline}>
        {!inline && (
          <RowBetween mb="16px">
            <Badge>
              <RowFixed>
                <StyledLogo src={info.logoUrl} style={{ margin: '0 8px 0 0' }} />
                {info.label}
              </RowFixed>
            </Badge>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          {confirmed ? (
            transactionSuccess ? (
              // <CheckCircle strokeWidth={1} size={inline ? '40px' : '90px'} color={theme.green1} />
              <AnimatedConfirmation />
            ) : (
              <AlertCircle strokeWidth={1} size={inline ? '40px' : '90px'} color={theme.red1} />
            )
          ) : (
            <CustomLightSpinner src={Circle} alt="loader" size={inline ? '40px' : '90px'} />
          )}
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={500} fontSize={20} textAlign="center">
            {!hash ? (
              <Trans>Confirm transaction in wallet</Trans>
            ) : !confirmed ? (
              <Trans>Transaction Submitted</Trans>
            ) : transactionSuccess ? (
              <Trans>Success</Trans>
            ) : (
              <Trans>Error</Trans>
            )}
          </Text>
          <Text fontWeight={400} fontSize={16} textAlign="center">
            {transaction ? <TransactionSummary info={transaction.info} /> : pendingText}
          </Text>
          {chainId && hash ? (
            <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
              <Text fontWeight={500} fontSize={14} color={theme.primary1}>
                <Trans>View on Explorer</Trans>
              </Text>
            </ExternalLink>
          ) : (
            <div style={{ height: '17px' }} />
          )}
          <Text color={theme.text3} style={{ margin: '20px 0 0 0' }} fontSize={'14px'}>
            {!secondsToConfirm ? (
              <div style={{ height: '24px' }} />
            ) : (
              <div>
                <Trans>Transaction completed in </Trans>
                <span style={{ fontWeight: 500, marginLeft: '4px', color: theme.text1 }}>
                  {secondsToConfirm} seconds 🎉
                </span>
              </div>
            )}
          </Text>
          <ButtonPrimary onClick={onDismiss} style={{ margin: '4px 0 0 0' }}>
            <Text fontWeight={500} fontSize={20}>
              {inline ? <Trans>Return</Trans> : <Trans>Close</Trans>}
            </Text>
          </ButtonPrimary>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

export interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash?: string | undefined // mod
  content?: () => ReactNode // mod
  attemptingTxn: boolean
  pendingText: ReactNode
  currencyToAdd?: Currency | undefined
  operationType: OperationType // mod
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
  operationType, // mod
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React()

  const isL2 = Boolean(chainId && L2_CHAIN_IDS.includes(chainId))

  if (!chainId) return null

  // confirmation screen
  return (
    // <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
    <GpModal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {isL2 && (hash || attemptingTxn) ? (
        <L2Content chainId={chainId} hash={hash} onDismiss={onDismiss} pendingText={pendingText} />
      ) : attemptingTxn ? (
        <ConfirmationPendingContent
          chainId={chainId}
          operationType={operationType}
          onDismiss={onDismiss}
          pendingText={pendingText}
        />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          onDismiss={onDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : (
        content && content()
      )}
    </GpModal>
  )
}
