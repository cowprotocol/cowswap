import { useWeb3React } from '@web3-react/core'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { useLimitOrdersTradeState } from './useLimitOrdersTradeState'
import { useSafeMemo } from '@cow/common/hooks/useSafeMemo'
import { GP_VAULT_RELAYER } from 'constants/index'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useTradeApproveState } from '@cow/common/containers/TradeApprove/useTradeApproveState'

export enum LimitOrdersFormState {
  NOT_APPROVED = 'NOT_APPROVED',
  CAN_TRADE = 'CAN_TRADE',
  LOADING = 'LOADING',
}

export function useLimitOrdersFormState(): LimitOrdersFormState {
  const { chainId, account } = useWeb3React()
  const tradeState = useLimitOrdersTradeState()

  const sellAmount = tradeState.inputCurrencyAmount
  const sellToken = tradeState.inputCurrency?.isToken ? tradeState.inputCurrency : undefined
  const spender = chainId ? GP_VAULT_RELAYER[chainId] : undefined

  const currentAllowance = useTokenAllowance(sellToken, account ?? undefined, spender)
  const approvalState = useTradeApproveState(sellAmount)

  return useSafeMemo(() => {
    if (!currentAllowance) {
      return LimitOrdersFormState.LOADING
    }

    if (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) {
      return LimitOrdersFormState.NOT_APPROVED
    }

    return LimitOrdersFormState.CAN_TRADE
  }, [currentAllowance, approvalState])
}
