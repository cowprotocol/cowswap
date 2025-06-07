import { useCallback, useMemo } from 'react'

import EtherscanImage from '@cowprotocol/assets/cow-swap/etherscan-icon.svg'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { getBlockExplorerUrl, getIsNativeToken } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/cow-sdk'
import { useAreThereTokensWithSameSymbol } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { Loader, TokenAmount, TokenName, TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount, MaxUint256, Token } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'
import { Link } from 'react-router'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'

import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes } from 'common/constants/routes'
import { useApproveCallback } from 'common/hooks/useApproveCallback'
import { ApprovalState, useApproveState } from 'common/hooks/useApproveState'
import { CardsSpinner, ExtLink } from 'pages/Account/styled'

import BalanceCell from './BalanceCell'
import FavoriteTokenButton from './FavoriteTokenButton'
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

type DataRowParams = {
  tokenData: TokenWithLogo
  index: number
  balance?: CurrencyAmount<Token> | undefined
  openApproveModal: (tokenSymbol?: string) => void
  closeApproveModal: Command
  toggleWalletModal: Command
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export const TokensTableRow = ({
  tokenData,
  index,
  balance,
  closeApproveModal,
  openApproveModal,
  toggleWalletModal,
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}: DataRowParams) => {
  const { account, chainId } = useWalletInfo()
  const areThereTokensWithSameSymbol = useAreThereTokensWithSameSymbol()

  const theme = useTheme()
  const tradeLink = useCallback(
    ({ symbol, address }: Token) => {
      const inputCurrencyId = areThereTokensWithSameSymbol(symbol, chainId) ? address : symbol

      return parameterizeTradeRoute(
        {
          chainId: chainId.toString(),
          inputCurrencyId,
          outputCurrencyId: undefined,
          inputCurrencyAmount: undefined,
          outputCurrencyAmount: undefined,
          orderKind: undefined,
        },
        Routes.SWAP,
      )
    },
    [areThereTokensWithSameSymbol, chainId],
  )

  const { handleSetError, handleCloseError } = useErrorModal()

  const vaultRelayer = chainId ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId] : undefined
  const isNativeToken = getIsNativeToken(tokenData)

  const amountToApprove = useMemo(() => CurrencyAmount.fromRawAmount(tokenData, MaxUint256), [tokenData])

  const { state: approvalState, currentAllowance } = useApproveState(isNativeToken ? null : amountToApprove)
  const approveCallback = useApproveCallback(amountToApprove, vaultRelayer)

  const handleApprove = useCallback(async () => {
    handleCloseError()

    if (!account) {
      toggleWalletModal()
      return
    }

    // TODO: make a separate hook out of this and add GA
    try {
      openApproveModal(tokenData?.symbol)
      await approveCallback(`Approve ${tokenData?.symbol || 'token'}`)
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`[TokensTableRow]: Issue approving.`, error)
      handleSetError(error?.message)
    } finally {
      closeApproveModal()
    }
  }, [
    account,
    approveCallback,
    handleCloseError,
    handleSetError,
    toggleWalletModal,
    tokenData?.symbol,
    openApproveModal,
    closeApproveModal,
  ])

  const hasZeroBalance = !balance || balance?.equalTo(0)

  const balanceLessThanAllowance = balance && currentAllowance ? balance.lessThan(currentAllowance.quotient) : false

  // This is so we only create fiat value request if there is a balance
  const fiatValue = useMemo(() => {
    if (!balance && account) {
      return <Loader stroke={theme.info} />
    } else if (hasZeroBalance) {
      return <BalanceValue hasBalance={false}>0</BalanceValue>
    } else {
      return <FiatBalanceCell balance={balance} />
    }
  }, [account, balance, hasZeroBalance, theme])

  const displayApproveContent = useMemo(() => {
    if (isNativeToken) {
      return null
    }

    if (approvalState === ApprovalState.APPROVED || balanceLessThanAllowance) {
      return <ApproveLabel>Approved ✓</ApproveLabel>
    }

    if (!account || approvalState === ApprovalState.NOT_APPROVED) {
      if (!currentAllowance || currentAllowance.equalTo(0)) {
        return <TableButton onClick={handleApprove}>Approve</TableButton>
      }

      return (
        <CustomLimit>
          <TableButton onClick={handleApprove}>Approve all</TableButton>
          <ApproveLabel>
            Approved:{' '}
            <strong>
              <TokenAmount amount={currentAllowance} />
            </strong>
          </ApproveLabel>
        </CustomLimit>
      )
    }

    return <CardsSpinner />
  }, [account, isNativeToken, currentAllowance, handleApprove, approvalState, balanceLessThanAllowance])

  return (
    <>
      <Cell>
        <FavoriteTokenButton tokenData={tokenData} />
        <IndexNumber>{index + 1}</IndexNumber>
      </Cell>

      <Cell>
        <Link to={tradeLink(tokenData)}>
          <ResponsiveLogo token={tokenData} size={28} />
          <TokenText>
            <span>
              <b>
                <TokenSymbol token={tokenData} />
              </b>
              <i>
                <TokenName token={tokenData} />
              </i>
            </span>
          </TokenText>
        </Link>
      </Cell>

      <Cell>
        <BalanceCell balance={balance} />
      </Cell>

      <Cell>{fiatValue}</Cell>

      <Cell>
        {displayApproveContent && (
          <>
            <ExtLink href={getBlockExplorerUrl(chainId, 'token', tokenData.address)}>
              <TableButton>
                <SVG src={EtherscanImage} title="View token contract" description="View token contract" />
              </TableButton>
            </ExtLink>
            {displayApproveContent}
          </>
        )}
      </Cell>
    </>
  )
}
