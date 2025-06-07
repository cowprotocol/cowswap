import { ReactNode, useCallback, useMemo } from 'react'

import { LpToken } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { LpTokenProvider } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { SelectTokenWidget } from 'modules/tokensList'
import { TradeWidget, TradeWidgetSlots, useReceiveAmountInfo, useTradePriceImpact } from 'modules/trade'
import { BulletListItem, UnlockWidgetScreen } from 'modules/trade/pure/UnlockWidgetScreen'
import { useHandleSwap } from 'modules/tradeFlow'
import { useTradeQuote } from 'modules/tradeQuote'
import { SettingsTab, TradeRateDetails } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { CoWAmmInlineBanner, SelectAPoolButton } from './elements'

import { usePoolsInfo } from '../../hooks/usePoolsInfo'
import { useVampireAttack, useVampireAttackFirstTarget } from '../../hooks/useVampireAttack'
import { useYieldDerivedState } from '../../hooks/useYieldDerivedState'
import {
  useYieldDeadlineState,
  useYieldRecipientToggleState,
  useYieldSettings,
  useYieldUnlockState,
} from '../../hooks/useYieldSettings'
import { useYieldWidgetActions } from '../../hooks/useYieldWidgetActions'
import { PoolApyPreview } from '../../pure/PoolApyPreview'
import { TargetPoolPreviewInfo } from '../../pure/TargetPoolPreviewInfo'
import { TradeButtons } from '../TradeButtons'
import { Warnings } from '../Warnings'
import { YieldConfirmModal } from '../YieldConfirmModal'

const YIELD_BULLET_LIST_CONTENT: BulletListItem[] = [
  { content: 'Maximize your yield on existing LP positions' },
  { content: 'Seamlessly swap your tokens into CoW AMM pools' },
  { content: 'Earn higher returns with reduced impermanent loss' },
  { content: 'Leverage advanced strategies for optimal growth' },
]

const YIELD_UNLOCK_SCREEN = {
  id: 'yield-widget',
  title: 'Unlock Enhanced Yield Features',
  subtitle: 'Boooost your current LP positions with CoW AMM’s pools.',
  orderType: 'yield',
  buttonText: 'Start boooosting your yield!',
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function YieldWidget() {
  const { chainId, account } = useWalletInfo()
  const { showRecipient } = useYieldSettings()
  const deadlineState = useYieldDeadlineState()
  const recipientToggleState = useYieldRecipientToggleState()
  const [isUnlocked, setIsUnlocked] = useYieldUnlockState()
  const { isLoading: isRateLoading } = useTradeQuote()
  const priceImpact = useTradePriceImpact()
  const widgetActions = useYieldWidgetActions()
  const receiveAmountInfo = useReceiveAmountInfo()
  const poolsInfo = usePoolsInfo()
  const vampireAttackContext = useVampireAttack()
  const vampireAttackTarget = useVampireAttackFirstTarget()

  const {
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    recipient,
  } = useYieldDerivedState()
  const doTrade = useHandleSwap(useSafeMemoObject({ deadline: deadlineState[0] }), widgetActions)

  const inputPoolState = useMemo(() => {
    if (!poolsInfo || !inputCurrency) return null

    return poolsInfo[getCurrencyAddress(inputCurrency).toLowerCase()]
  }, [inputCurrency, poolsInfo])

  const outputPoolState = useMemo(() => {
    if (!poolsInfo || !outputCurrency) return null

    return poolsInfo[getCurrencyAddress(outputCurrency).toLowerCase()]
  }, [outputCurrency, poolsInfo])

  const isOutputLpToken = Boolean(outputCurrency && outputCurrency instanceof LpToken)
  const inputApy = inputPoolState?.info.apy
  const outputApy = outputPoolState?.info.apy

  const isTradeContainAlternativePool =
    inputCurrency instanceof LpToken &&
    outputCurrency instanceof LpToken &&
    inputCurrency.tokens.every((token) => outputCurrency.tokens.includes(token))

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: true,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
    topContent: inputCurrency && (
      <TargetPoolPreviewInfo chainId={chainId} sellToken={inputCurrency}>
        <PoolApyPreview
          apy={inputApy}
          isSuperior={Boolean(
            isTradeContainAlternativePool &&
              inputCurrency.lpTokenProvider === LpTokenProvider.COW_AMM &&
              (inputApy && outputApy ? inputApy > outputApy : true),
          )}
        />
      </TargetPoolPreviewInfo>
    ),
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: false,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo,
    topContent: outputCurrency ? (
      <TargetPoolPreviewInfo chainId={chainId} sellToken={outputCurrency} oppositeToken={inputCurrency}>
        <PoolApyPreview
          apy={outputApy}
          isSuperior={Boolean(
            isTradeContainAlternativePool &&
              outputCurrency.lpTokenProvider === LpTokenProvider.COW_AMM &&
              (inputApy && outputApy ? outputApy > inputApy : true),
          )}
        />
      </TargetPoolPreviewInfo>
    ) : null,
  }
  const inputCurrencyPreviewInfo = {
    amount: inputCurrencyInfo.amount,
    fiatAmount: inputCurrencyInfo.fiatAmount,
    balance: inputCurrencyInfo.balance,
    label: 'Sell amount',
  }

  const outputCurrencyPreviewInfo = {
    amount: outputCurrencyInfo.amount,
    fiatAmount: outputCurrencyInfo.fiatAmount,
    balance: outputCurrencyInfo.balance,
    label: 'Receive (before fees)',
  }

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  const slots: TradeWidgetSlots = {
    topContent: vampireAttackContext ? (
      <CoWAmmInlineBanner token={vampireAttackTarget?.target.token} apyDiff={vampireAttackTarget?.apyDiff} />
    ) : !account ? (
      <CoWAmmInlineBanner token={undefined} apyDiff={undefined} />
    ) : null,
    selectTokenWidget: <SelectTokenWidget displayLpTokenLists />,
    settingsWidget: <SettingsTab recipientToggleState={recipientToggleState} deadlineState={deadlineState} />,
    bottomContent: useCallback(
      (tradeWarnings: ReactNode | null) => {
        return (
          <>
            <TradeRateDetails
              isTradePriceUpdating={isRateLoading}
              rateInfoParams={rateInfoParams}
              deadline={deadlineState[0]}
            />
            <Warnings />
            {tradeWarnings}
            <TradeButtons isOutputLpToken={isOutputLpToken} isTradeContextReady={doTrade.contextIsReady} />
          </>
        )
      },
      [doTrade.contextIsReady, isRateLoading, rateInfoParams, deadlineState, isOutputLpToken],
    ),

    lockScreen: !isUnlocked ? (
      <UnlockWidgetScreen
        id={YIELD_UNLOCK_SCREEN.id}
        items={YIELD_BULLET_LIST_CONTENT}
        handleUnlock={() => setIsUnlocked(true)}
        title={YIELD_UNLOCK_SCREEN.title}
        subtitle={YIELD_UNLOCK_SCREEN.subtitle}
        orderType={YIELD_UNLOCK_SCREEN.orderType}
        buttonText={YIELD_UNLOCK_SCREEN.buttonText}
      />
    ) : undefined,
  }

  const params = {
    compactView: true,
    enableSmartSlippage: true,
    displayTokenName: true,
    isMarketOrderWidget: true,
    recipient,
    showRecipient,
    isTradePriceUpdating: isRateLoading,
    priceImpact,
    customSelectTokenButton: SelectAPoolButton,
  }

  return (
    <TradeWidget
      disableOutput
      slots={slots}
      actions={widgetActions}
      params={params}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
      confirmModal={
        <YieldConfirmModal
          doTrade={doTrade.callback}
          recipient={recipient}
          priceImpact={priceImpact}
          inputCurrencyInfo={inputCurrencyPreviewInfo}
          outputCurrencyInfo={outputCurrencyPreviewInfo}
        />
      }
    />
  )
}
