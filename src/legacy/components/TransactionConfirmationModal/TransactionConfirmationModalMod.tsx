import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import Badge from 'legacy/components/Badge'
import { getChainInfo } from 'legacy/constants/chainInfo'
import { ReactNode, useContext, useMemo } from 'react'
import { AlertCircle, AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
import { isL2ChainId } from 'legacy/utils/chains'

import Circle from 'legacy/assets/images/blue-loader.svg'
import { CloseIcon, CustomLightSpinner, ExternalLink } from 'legacy/theme'
import { ButtonPrimary } from '../Button'
import { AutoColumn, ColumnCenter } from 'legacy/components/Column'
import { RowBetween, RowFixed } from 'legacy/components/Row'
import AnimatedConfirmation from 'legacy/components/TransactionConfirmationModal/AnimatedConfirmation'

import { GpModal } from 'common/pure/Modal'
import {
  ConfirmationModalContentProps,
  ConfirmationPendingContent,
  OperationType,
  TransactionSubmittedContent,
} from '.'
import { CloseIconWrapper, GPModalHeader } from './styled'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { handleFollowPendingTxPopupAtom, useUpdateAtom } from 'legacy/state/application/atoms'
import { useIsTransactionConfirmed, useTransaction } from 'legacy/state/enhancedTransactions/hooks'
import { getEtherscanLink as getExplorerLink } from 'legacy/utils'
import { useWalletInfo } from 'modules/wallet'

export const Wrapper = styled.div`
  width: 100%;
  /* padding: 1rem; */
  /* -- mod -- */
  padding: 0 16px;
  display: flex;
  flex-flow: column nowrap;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  height: inherit;
  ${({ theme }) => theme.colorScrollbar};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 10px;
  `}/* -- mod -- */
`
export const Section = styled(AutoColumn)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '16px 0 0' : '0')};
`

export const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  /* -- mod -- */
  padding: 0 0 16px;
`

const ConfirmedIcon = styled(ColumnCenter)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '20px 0' : '32px 0;')};
`

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`

export function ConfirmationModalContent({
  title,
  titleSize,
  styles,
  className,
  bottomContent,
  onDismiss,
  topContent,
}: ConfirmationModalContentProps) {
  return (
    <Wrapper className={className}>
      <Section>
        <GPModalHeader>
          <Text fontWeight={600} fontSize={titleSize || 16} style={styles}>
            {title}
          </Text>
          <CloseIconWrapper onClick={() => onDismiss()} />
        </GPModalHeader>
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
        <GPModalHeader>
          {/* <RowBetween> */}
          <Text fontWeight={500} fontSize={20}>
            <Trans>Error</Trans>
          </Text>
          <CloseIcon onClick={onDismiss} />
        </GPModalHeader>
        {/* </RowBetween> */}
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

export function L2Content({
  onDismiss,
  chainId,
  hash,
  pendingText,
  inline,
  isLimitOrderSubmit,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: SupportedChainId
  currencyToAdd?: Currency | undefined
  pendingText: ReactNode
  inline?: boolean // not in modal
  isLimitOrderSubmit?: boolean
}) {
  const theme = useContext(ThemeContext)

  const transaction = useTransaction(hash)
  const confirmed = useIsTransactionConfirmed(hash)
  const transactionSuccess = transaction?.receipt?.status === 1

  // convert unix time difference to seconds
  const secondsToConfirm = transaction?.confirmedTime
    ? (transaction.confirmedTime - transaction.addedTime) / 1000
    : undefined

  const info = getChainInfo(chainId)

  const displayIcon = useMemo(() => {
    if (isLimitOrderSubmit) {
      return <AnimatedConfirmation />
    } else if (!confirmed) {
      return <CustomLightSpinner src={Circle} alt="loader" size={inline ? '40px' : '90px'} />
    } else {
      return transactionSuccess ? (
        <AnimatedConfirmation />
      ) : (
        <AlertCircle strokeWidth={1} size={inline ? '40px' : '90px'} color={theme.red1} />
      )
    }
  }, [confirmed, inline, isLimitOrderSubmit, theme.red1, transactionSuccess])

  const displayButtonText = useMemo(() => {
    if (isLimitOrderSubmit || !inline) return 'Close'
    else return 'Return'
  }, [inline, isLimitOrderSubmit])

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
        <ConfirmedIcon inline={inline}>{displayIcon}</ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'} style={{ margin: '0 0 16px' }}>
          <Text fontWeight={500} fontSize={20} textAlign="center">
            {!hash ? (
              <Trans>Confirm transaction in wallet</Trans>
            ) : !confirmed ? (
              <Trans>{isLimitOrderSubmit ? 'Order' : 'Transaction'} Submitted</Trans>
            ) : transactionSuccess ? (
              <Trans>Success</Trans>
            ) : (
              <Trans>Error</Trans>
            )}
          </Text>
          <Text fontWeight={400} fontSize={16} textAlign="center">
            {transaction?.summary || pendingText}
          </Text>
          {chainId && hash ? (
            <ExternalLink href={getExplorerLink(chainId, hash, 'transaction')}>
              <Text fontWeight={500} fontSize={14} color={theme.primary1}>
                <Trans>View on Explorer ↗</Trans>
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
              <Trans>{displayButtonText}</Trans>
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
  hash?: string | undefined
  content?: () => ReactNode
  attemptingTxn: boolean
  pendingText: ReactNode
  currencyToAdd?: Currency | undefined
  operationType: OperationType
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
  operationType,
}: ConfirmationModalProps) {
  const { chainId } = useWalletInfo()
  const setShowFollowPendingTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)

  if (!chainId) return null

  const _onDismiss =
    !isL2ChainId(chainId) && !attemptingTxn && hash
      ? () => {
          setShowFollowPendingTxPopup(true)
          onDismiss()
        }
      : onDismiss

  // confirmation screen
  return (
    <GpModal isOpen={isOpen} onDismiss={_onDismiss} maxHeight={90} maxWidth={hash ? 850 : 470}>
      {isL2ChainId(chainId) && (hash || attemptingTxn) ? (
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
          onDismiss={_onDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : (
        content && content()
      )}
    </GpModal>
  )
}
