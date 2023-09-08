import { useCallback, useEffect, useMemo, useState } from 'react'

import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, MaxUint256, Token } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'
import { Link } from 'react-router-dom'

import EtherscanImage from 'legacy/assets/cow-swap/etherscan-icon.svg'
import Loader from 'legacy/components/Loader'
import { ConfirmOperationType } from 'legacy/components/TransactionConfirmationModal'
import { GP_VAULT_RELAYER } from 'legacy/constants'
import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import usePrevious from 'legacy/hooks/usePrevious'
import useTheme from 'legacy/hooks/useTheme'
import { useTokenAllowance } from 'legacy/hooks/useTokenAllowance'
import { getBlockExplorerUrl } from 'legacy/utils'

import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'
import { useWalletInfo } from 'modules/wallet'

import { Routes } from 'common/constants/routes'
import { useAreThereTokensWithSameSymbol } from 'common/hooks/useAreThereTokensWithSameSymbol'
import { TokenAmount } from 'common/pure/TokenAmount'
import { TokenSymbol } from 'common/pure/TokenSymbol'
import { CardsSpinner, ExtLink } from 'pages/Account/styled'

import BalanceCell from './BalanceCell'
import FavouriteTokenButton from './FavouriteTokenButton'
import { FiatBalanceCell } from './FiatBalanceCell'
import {
  ApproveLabel,
  BalanceValue,
  Cell,
  CustomLimit,
  IndexNumber,
  ResponsiveLogo,
  TableButton,
  TokenText,
} from './styled'

import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback/useApproveCallbackMod'

type DataRowParams = {
  tokenData: Token
  index: number
  balance?: CurrencyAmount<Token> | undefined
  closeModals: () => void
  openTransactionConfirmationModal: (message: string, operationType: ConfirmOperationType) => void
  toggleWalletModal: () => void
}

export const TokensTableRow = ({
  tokenData,
  index,
  balance,
  closeModals,
  openTransactionConfirmationModal,
  toggleWalletModal,
}: DataRowParams) => {
  const { account, chainId = ChainId.MAINNET } = useWalletInfo()
  const areThereTokensWithSameSymbol = useAreThereTokensWithSameSymbol()

  const theme = useTheme()
  const tradeLink = useCallback(
    ({ symbol, address }: Token) => {
      const inputCurrencyId = areThereTokensWithSameSymbol(symbol) ? address : symbol

      return parameterizeTradeRoute(
        { chainId: chainId.toString(), inputCurrencyId, outputCurrencyId: undefined },
        Routes.SWAP
      )
    },
    [areThereTokensWithSameSymbol, chainId]
  )

  // allowance
  const spender = chainId ? GP_VAULT_RELAYER[chainId] : undefined
  const currentAllowance = useTokenAllowance(tokenData, account ?? undefined, spender)

  // approve
  const [approving, setApproving] = useState(false)

  const { handleSetError, handleCloseError } = useErrorModal()

  const vaultRelayer = chainId ? GP_VAULT_RELAYER[chainId] : undefined
  const amountToApprove = CurrencyAmount.fromRawAmount(tokenData, MaxUint256)
  const amountToCheckAgainstAllowance = currentAllowance?.equalTo(0) ? undefined : balance

  const { approvalState, approve } = useApproveCallback({
    openTransactionConfirmationModal,
    closeModals,
    spender: vaultRelayer,
    amountToApprove,
    amountToCheckAgainstAllowance,
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
    } catch (error: any) {
      console.error(`[TokensTableRow]: Issue approving.`, error)
      handleSetError(error?.message)
    } finally {
      setApproving(false)
    }
  }, [account, approve, handleCloseError, handleSetError, toggleWalletModal, tokenData?.symbol])

  const isApproved = approvalState === ApprovalState.APPROVED
  const isPendingOnchainApprove = approvalState === ApprovalState.PENDING
  const isPendingApprove = !isApproved && (approving || isPendingOnchainApprove)

  const hasZeroBalance = !balance || balance?.equalTo(0)
  const hasNoAllowance = !currentAllowance || currentAllowance.equalTo(0)

  // This is so we only create fiat value request if there is a balance
  const fiatValue = useMemo(() => {
    if (!balance && account) {
      return <Loader stroke={theme.text3} />
    } else if (hasZeroBalance) {
      return <BalanceValue hasBalance={false}>0</BalanceValue>
    } else {
      return <FiatBalanceCell balance={balance} />
    }
  }, [account, balance, hasZeroBalance, theme])

  const displayApproveContent = useMemo(() => {
    if (isPendingApprove) {
      return <CardsSpinner />
    } else if (!isApproved && !hasNoAllowance) {
      return (
        <CustomLimit>
          <TableButton onClick={handleApprove} color={theme.text1}>
            Approve all
          </TableButton>
          <ApproveLabel color={theme.green1}>
            Approved:{' '}
            <strong>
              <TokenAmount amount={currentAllowance} />
            </strong>
          </ApproveLabel>
        </CustomLimit>
      )
    } else if (!isApproved || hasNoAllowance) {
      return (
        <TableButton onClick={handleApprove} color={theme.text1}>
          Approve
        </TableButton>
      )
    } else {
      return <ApproveLabel color={theme.green1}>Approved ✓</ApproveLabel>
    }
  }, [currentAllowance, handleApprove, isApproved, isPendingApprove, hasNoAllowance, theme.green1, theme.text1])

  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApproving(true)
    } else if (prevApprovalState === ApprovalState.PENDING && approvalState === ApprovalState.NOT_APPROVED) {
      setApproving(false)
    }
  }, [approvalState, prevApprovalState, approving])

  return (
    <>
      <Cell>
        <FavouriteTokenButton tokenData={tokenData} />
        <IndexNumber>{index + 1}</IndexNumber>
      </Cell>

      <Cell>
        <Link to={tradeLink(tokenData)}>
          <ResponsiveLogo currency={tokenData} />
          <TokenText>
            <span>
              <b>
                <TokenSymbol token={tokenData} />
              </b>
              <i>{tokenData.name}</i>
            </span>
          </TokenText>
        </Link>
      </Cell>

      <Cell>
        <BalanceCell balance={balance} />
      </Cell>

      <Cell>{fiatValue}</Cell>

      <Cell>
        <ExtLink href={getBlockExplorerUrl(chainId, 'token', tokenData.address)}>
          <TableButton>
            <SVG src={EtherscanImage} title="View token contract" description="View token contract" />
          </TableButton>
        </ExtLink>
        {displayApproveContent}
      </Cell>
    </>
  )
}
