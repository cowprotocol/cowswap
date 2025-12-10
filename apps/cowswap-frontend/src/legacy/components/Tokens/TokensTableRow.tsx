import { ReactNode, useCallback, useMemo } from 'react'

import EtherscanImage from '@cowprotocol/assets/cow-swap/etherscan-icon.svg'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { getBlockExplorerUrl, getIsNativeToken, isFractionFalsy } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/cow-sdk'
import { useAreThereTokensWithSameSymbol } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { Loader, TokenAmount, TokenName, TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount, MaxUint256, Token } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import { Link } from 'react-router'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useHasPendingApproval } from 'legacy/state/enhancedTransactions/hooks'

import { ApprovalState, getApprovalState, useApproveCallback } from 'modules/erc20Approve'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes } from 'common/constants/routes'
import { useSafeMemo } from 'common/hooks/useSafeMemo'
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
  balance: CurrencyAmount<Token> | undefined
  allowance: CurrencyAmount<Token> | undefined
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
  allowance,
  closeApproveModal,
  openApproveModal,
  toggleWalletModal,
}: DataRowParams): ReactNode => {
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

  const tokenAddress = tokenData.address.toLowerCase()

  const pendingApproval = useHasPendingApproval(tokenAddress)

  const approvalState = useSafeMemo(() => {
    if (isNativeToken) return ApprovalState.APPROVED
    if (!allowance) return ApprovalState.UNKNOWN

    return getApprovalState(amountToApprove, BigInt(allowance.quotient.toString()), pendingApproval)
  }, [amountToApprove, allowance, isNativeToken, pendingApproval])

  const approveCallback = useApproveCallback(amountToApprove.currency, vaultRelayer)

  const handleApprove = useCallback(async () => {
    handleCloseError()

    if (!account) {
      toggleWalletModal()
      return
    }

    // TODO: make a separate hook out of this and add GA
    try {
      openApproveModal(tokenData?.symbol)

      const symbol = tokenData?.symbol || t`token`
      await approveCallback(amountToApprove, t`Approve ${symbol}`)

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
    amountToApprove,
  ])

  const hasZeroBalance = !balance || balance?.equalTo(0)

  const balanceLessThanAllowance = balance && allowance ? balance.lessThan(allowance) : false

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
      return (
        <ApproveLabel>
          <Trans>Approved</Trans> ✓
        </ApproveLabel>
      )
    }

    if (!account || approvalState === ApprovalState.NOT_APPROVED) {
      if (isFractionFalsy(allowance)) {
        return (
          <TableButton onClick={handleApprove}>
            <Trans>Approve</Trans>
          </TableButton>
        )
      }

      return (
        <CustomLimit>
          <TableButton onClick={handleApprove}>
            <Trans>Approve all</Trans>
          </TableButton>
          <ApproveLabel>
            <Trans>Approved</Trans>:{' '}
            <strong>
              <TokenAmount amount={allowance} />
            </strong>
          </ApproveLabel>
        </CustomLimit>
      )
    }

    return <CardsSpinner />
  }, [account, isNativeToken, allowance, handleApprove, approvalState, balanceLessThanAllowance])

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
                <SVG src={EtherscanImage} title={t`View token contract`} description={t`View token contract`} />
              </TableButton>
            </ExtLink>
            {displayApproveContent}
          </>
        )}
      </Cell>
    </>
  )
}
