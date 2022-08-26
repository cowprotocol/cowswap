import { ButtonConfirmed } from 'components/Button'
import { ApprovalState, OptionalApproveCallbackParams } from 'hooks/useApproveCallback'
import { UseERC20PermitState } from '@src/hooks/useERC20Permit'
import { AutoRow } from '@src/components/Row'
import CurrencyLogo from 'components/CurrencyLogo'
import { Trans } from '@lingui/macro'
import Loader from '@src/components/Loader'
import { CheckCircle, HelpCircle } from 'react-feather'
import { MouseoverTooltip } from 'components/Tooltip'
import { ButtonSize } from 'theme'
import { useCallback, useContext, useEffect } from 'react'
import { getProviderErrorMessage, isRejectRequestProviderError } from 'utils/misc'
import { approvalAnalytics } from 'utils/analytics'
import { useERC20PermitFromTrade } from 'hooks/useERC20Permit'
import TradeGp from 'state/swap/TradeGp'
import { Currency, Percent } from '@uniswap/sdk-core'
import { BigNumber } from '@ethersproject/bignumber'
import { swapConfirmAtom, SwapConfirmState } from 'pages/Swap/state/swapConfirmAtom'
import { ThemeContext } from 'styled-components/macro'
import usePrevious from '@src/hooks/usePrevious'
import { ButtonError } from 'components/Button'
import { HandleSwapCallback } from 'pages/Swap/helpers/useHandleSwap'
import { useUpdateAtom } from 'jotai/utils'

export interface ApproveButtonProps {
  currencyIn: Currency | undefined | null
  trade: TradeGp | undefined
  allowedSlippage: Percent
  transactionDeadline: BigNumber | undefined
  swapConfirmState: SwapConfirmState
  isExpertMode: boolean
  handleSwap: HandleSwapCallback
  isValid: boolean
  approvalState: ApprovalState
  approveCallback: (params?: OptionalApproveCallbackParams) => Promise<void>
  approvalSubmitted: boolean
  setApprovalSubmitted: (state: boolean) => void
  children?: React.ReactNode
}

export function ApproveButton(props: ApproveButtonProps) {
  const {
    trade,
    allowedSlippage,
    transactionDeadline,
    swapConfirmState,
    currencyIn,
    isExpertMode,
    handleSwap,
    isValid,
    approvalState,
    approveCallback,
    approvalSubmitted,
    setApprovalSubmitted,
    children,
  } = props

  const theme = useContext(ThemeContext)
  const setSwapState = useUpdateAtom(swapConfirmAtom)

  const { showConfirm, tradeToConfirm } = swapConfirmState

  const {
    state: signatureState,
    // signatureData,
    gatherPermitSignature,
  } = useERC20PermitFromTrade(trade, allowedSlippage, transactionDeadline)

  const prevApprovalState = usePrevious(approvalState)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
      // mod
    } else if (prevApprovalState === ApprovalState.PENDING && approvalState === ApprovalState.NOT_APPROVED) {
      // user canceled the approval tx, reset the UI
      setApprovalSubmitted(false)
    }
  }, [approvalState, approvalSubmitted, prevApprovalState, setApprovalSubmitted])

  const handleApprove = useCallback(async () => {
    let approveRequired = false // mod
    if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
      try {
        await gatherPermitSignature()
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (!isRejectRequestProviderError(error)) {
          approveRequired = true
        }
      }
    } else {
      approveRequired = true
    }

    if (approveRequired) {
      const symbol = trade?.inputAmount?.currency.symbol
      // const symbol = v2Trade?.inputAmount?.currency.symbol // TODO: double check
      approvalAnalytics('Send', symbol)
      return approveCallback()
        .then(() => {
          approvalAnalytics('Sign', symbol)
        })
        .catch((error) => {
          console.error('Error setting the allowance for token', error)

          let swapErrorMessage, errorCode
          if (isRejectRequestProviderError(error)) {
            swapErrorMessage = 'User rejected approving the token'
            approvalAnalytics('Reject', symbol)
          } else {
            swapErrorMessage = getProviderErrorMessage(error)

            if (error?.code && typeof error.code === 'number') {
              errorCode = error.code
            }

            approvalAnalytics('Error', symbol, errorCode)
          }

          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage,
            txHash: undefined,
          })
        })
    }
  }, [
    setSwapState,
    approveCallback,
    gatherPermitSignature,
    showConfirm,
    signatureState,
    tradeToConfirm,
    trade?.inputAmount?.currency.symbol,
    // v2Trade?.inputAmount?.currency.symbol, // TODO: doublecheck
  ])

  return (
    <>
      <ButtonConfirmed
        buttonSize={ButtonSize.BIG}
        onClick={handleApprove}
        disabled={
          approvalState !== ApprovalState.NOT_APPROVED ||
          approvalSubmitted ||
          signatureState === UseERC20PermitState.SIGNED
        }
        width="100%"
        marginBottom={10}
        altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
        confirmed={approvalState === ApprovalState.APPROVED || signatureState === UseERC20PermitState.SIGNED}
      >
        <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              width: '100%',
              fontSize: '13px',
            }}
          >
            <CurrencyLogo currency={currencyIn} size={'20px'} style={{ flexShrink: 0 }} />
            {/* we need to shorten this string on mobile */}
            {approvalState === ApprovalState.APPROVED || signatureState === UseERC20PermitState.SIGNED ? (
              <Trans>You can now trade {currencyIn?.symbol}</Trans>
            ) : (
              <Trans>Allow CoW Swap to use your {currencyIn?.symbol}</Trans>
            )}
            {approvalState === ApprovalState.PENDING ? (
              <Loader stroke="white" />
            ) : (approvalSubmitted && approvalState === ApprovalState.APPROVED) ||
              signatureState === UseERC20PermitState.SIGNED ? (
              <CheckCircle size="20" color={theme.green1} />
            ) : (
              <MouseoverTooltip
                text={
                  <Trans>
                    You must give the CoW Protocol smart contracts permission to use your {currencyIn?.symbol}. You only
                    have to do this once per token.
                  </Trans>
                }
              >
                <HelpCircle size="20" color={'white'} />
              </MouseoverTooltip>
            )}
          </span>
        </AutoRow>
      </ButtonConfirmed>
      <ButtonError
        buttonSize={ButtonSize.BIG}
        onClick={() => {
          if (isExpertMode) {
            handleSwap()
          } else {
            setSwapState({
              tradeToConfirm: trade,
              attemptingTxn: false,
              swapErrorMessage: undefined,
              showConfirm: true,
              txHash: undefined,
            })
          }
        }}
        width="100%"
        id="swap-button"
        disabled={
          !isValid || (approvalState !== ApprovalState.APPROVED && signatureState !== UseERC20PermitState.SIGNED)
        }
      >
        {children}
      </ButtonError>
    </>
  )
}
