import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import { getChainInfo } from 'constants/chainInfo'
// import { SupportedL2ChainId } from 'constants/chains'
// import useCurrencyLogoURIs from 'lib/hooks/useCurrencyLogoURIs'
import { ReactNode /*, useCallback*/, useContext /*, useState*/, useMemo } from 'react'
import { AlertCircle, AlertTriangle /*, ArrowUpCircle, CheckCircle */ } from 'react-feather'
import { Text } from 'rebass'
import { useIsTransactionConfirmed, useTransaction } from 'state/transactions/hooks'
import styled, { ThemeContext } from 'styled-components/macro'
import { isL2ChainId } from 'utils/chains'

import Circle from 'assets/images/blue-loader.svg'
import { CloseIcon, CustomLightSpinner, ExternalLink } from 'theme'
// import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { TransactionSummary } from 'components/AccountDetails/TransactionSummary'
import { /* ButtonLight */ ButtonPrimary } from '../Button'
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
import { useUpdateAtom, handleFollowPendingTxPopupAtom } from 'state/application/atoms'
import { getEtherscanLink as getExplorerLink } from 'utils'

export const Wrapper = styled.div`
  width: 100%;
  /* padding: 1rem; */
  /* -- mod -- */
  padding: 0 16px;
  display: flex;
  flex-flow: column nowrap;
  ${({ theme }) => theme.colorScrollbar};
  /* -- mod -- */
`
export const Section = styled(AutoColumn)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '0' : '0')};
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

  const { connector } = useWeb3React()

  const token = currencyToAdd?.wrapped
  const logoURL = useCurrencyLogoURIs(token)[0]

  const [success, setSuccess] = useState<boolean | undefined>()

  const addToken = useCallback(() => {
    if (!token?.symbol || !connector.watchAsset) return
    connector
      .watchAsset({
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        image: logoURL,
      })
      .then(() => setSuccess(true))
      .catch(() => setSuccess(false))
  }, [connector, logoURL, token])

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
          {currencyToAdd && connector.watchAsset && (
            <ButtonLight mt="12px" padding="6px 12px" width="fit-content" onClick={addToken}>
              {!success ? (
                <RowFixed>
                  <Trans>Add {currencyToAdd.symbol}</Trans>
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
  className, // mod
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
    <Wrapper className={className}>
      <Section>
        {/* <RowBetween> */}
        <GPModalHeader>
          <Text
            fontWeight={600} // MOD
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
        <AutoColumn gap="12px" justify={'center'}>
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
            {transaction ? <TransactionSummary info={transaction.info} /> : pendingText}
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
  const { chainId } = useWeb3React()
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
    // <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
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
