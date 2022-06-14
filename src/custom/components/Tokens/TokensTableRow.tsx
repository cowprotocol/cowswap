import { useState, useMemo, useCallback, useEffect } from 'react'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { RowFixed } from 'components/Row'
import useTheme from 'hooks/useTheme'
import {
  TokenText,
  ResponsiveGrid,
  Label,
  LargeOnly,
  HideLarge,
  ResponsiveLogo,
  IndexNumber,
  BalanceValue,
  Cell,
  TableButton,
  ApproveLabel,
  CustomLimit,
} from './styled'
import FavouriteTokenButton from './FavouriteTokenButton'
import { TableType } from './TokensTable'
import { formatSmart } from 'utils/format'
import { useApproveCallbackFromBalance, ApprovalState } from 'hooks/useApproveCallback'
import { OperationType } from 'components/TransactionConfirmationModal'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import { CardsSpinner } from 'pages/Profile/styled'
import usePrevious from 'hooks/usePrevious'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { useActiveWeb3React } from 'hooks/web3'
import { GP_VAULT_RELAYER, AMOUNT_PRECISION } from 'constants/index'

type DataRowParams = {
  tokenData: Token
  index: number
  tableType?: TableType
  balance?: CurrencyAmount<Token> | undefined
  handleBuy: (token: Token) => void
  handleSell: (token: Token) => void
  closeModal: () => void
  openModal: (message: string, operationType: OperationType) => void
  toggleWalletModal: () => void
}

const DataRow = ({
  tokenData,
  index,
  balance,
  handleBuy,
  handleSell,
  closeModal,
  openModal,
  toggleWalletModal,
}: DataRowParams) => {
  const { account, chainId } = useActiveWeb3React()

  const theme = useTheme()
  const hasBalance = balance?.greaterThan(0)
  const formattedBalance = formatSmart(balance) || 0

  // allowance
  const spender = chainId ? GP_VAULT_RELAYER[chainId] : undefined
  const currentAllowance = useTokenAllowance(tokenData, account ?? undefined, spender)

  // approve
  const [approving, setApproving] = useState(false)

  const { handleSetError, handleCloseError } = useErrorModal()

  const { approvalState, approve } = useApproveCallbackFromBalance({
    openTransactionConfirmationModal: openModal,
    closeModals: closeModal,
    token: tokenData,
    balance,
  })

  const prevApprovalState = usePrevious(approvalState)

  const handleApprove = useCallback(async () => {
    handleCloseError()

    if (!account) {
      toggleWalletModal()
      return
    }

    // TODO: make a separate hook out of this and add GA
    try {
      setApproving(true)
      const summary = `Approve ${tokenData?.symbol || 'token'}`
      await approve({ modalMessage: summary, transactionSummary: summary })
    } catch (error) {
      console.error(`[TokensTableRow]: Issue approving.`, error)
      handleSetError(error?.message)
    } finally {
      setApproving(false)
    }
  }, [account, approve, handleCloseError, handleSetError, toggleWalletModal, tokenData?.symbol])

  const isApproved = approvalState === ApprovalState.APPROVED
  const isPendingOnchainApprove = approvalState === ApprovalState.PENDING
  const isPendingApprove = !isApproved && (approving || isPendingOnchainApprove)

  const noBalance = !balance || balance?.equalTo(0)

  const displayApproveContent = useMemo(() => {
    if (noBalance) {
      return <ApproveLabel>No balance</ApproveLabel>
    } else if (isPendingApprove) {
      return <CardsSpinner />
    } else if (isApproved) {
      return <ApproveLabel color={theme.green1}>Approved ✓</ApproveLabel>
    } else if (!isApproved && currentAllowance && !currentAllowance?.equalTo(0)) {
      return (
        <CustomLimit>
          <TableButton outlined onClick={handleApprove} color={theme.primary1}>
            Approve all
          </TableButton>
          <ApproveLabel color={theme.green1} title={`Approved: ${currentAllowance.toExact()}`}>
            Approved: <strong>{formatSmart(currentAllowance, AMOUNT_PRECISION)}</strong>
          </ApproveLabel>
        </CustomLimit>
      )
    } else {
      return (
        <TableButton outlined onClick={handleApprove} color={theme.primary1}>
          Approve
        </TableButton>
      )
    }
  }, [currentAllowance, handleApprove, isApproved, isPendingApprove, noBalance, theme.green1, theme.primary1])

  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApproving(true)
    } else if (prevApprovalState === ApprovalState.PENDING && approvalState === ApprovalState.NOT_APPROVED) {
      setApproving(false)
    }
  }, [approvalState, prevApprovalState, approving])

  return (
    <ResponsiveGrid>
      <Cell>
        <FavouriteTokenButton tokenData={tokenData} />
        <IndexNumber>{index + 1}</IndexNumber>
      </Cell>

      <Cell>
        <RowFixed>
          <ResponsiveLogo currency={tokenData} />
        </RowFixed>

        <TokenText>
          <LargeOnly style={{ marginLeft: '10px' }}>
            <Label>{tokenData.symbol}</Label>
          </LargeOnly>

          <HideLarge style={{ marginLeft: '10px' }}>
            <RowFixed>
              <Label fontWeight={400} ml="8px" color={theme.text1}>
                {tokenData.name}
              </Label>
              <Label ml="8px" color={theme.primary5}>
                ({tokenData.symbol})
              </Label>
            </RowFixed>
          </HideLarge>
        </TokenText>
      </Cell>

      <Cell>
        <BalanceValue title={balance?.toExact()} hasBalance={!!hasBalance}>
          {formattedBalance}
        </BalanceValue>
      </Cell>

      <Cell>
        <TableButton onClick={() => handleBuy(tokenData)} color={theme.green1}>
          Buy
        </TableButton>
      </Cell>

      <Cell>
        <TableButton disabled={noBalance} onClick={() => handleSell(tokenData)} color={theme.red1}>
          Sell
        </TableButton>
      </Cell>

      <Cell>{displayApproveContent}</Cell>
    </ResponsiveGrid>
  )
}

export default DataRow
