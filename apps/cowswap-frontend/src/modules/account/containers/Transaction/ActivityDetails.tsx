import { ReactNode } from 'react'

import { BannerOrientation } from '@cowprotocol/ui'

import { EthFlowStepper } from 'modules/ethFlow'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { CustomRecipientWarningBanner } from 'common/pure/CustomRecipientWarningBanner'
import { ActivityDerivedState } from 'common/types/activity'

import { useActivityDetailsState } from './hooks/useActivityDetailsState'
import { ActivityDetailsContent } from './pure/ActivityDetailsContent'
import { ActivityVisualContent } from './pure/ActivityVisualContent'
import { GnosisSafeTxDetails } from './pure/GnosisSafeTxDetails'
import { RegularOrderLayout } from './pure/RegularOrderLayout'
import { StatusDetails } from './StatusDetails'
import {
  CreationTimeText,
  Summary,
  SummaryInner,
  TransactionState as ActivityLink,
} from './styled'

function ActivityDetailsMain(props: {
  state: ReturnType<typeof useActivityDetailsState>
  chainId: number
  activityDerivedState: ActivityDerivedState
  activityLinkUrl: string | undefined
  disableMouseActions: boolean | undefined
  creationTime?: string | undefined
  summary: string | undefined
  enhancedTransaction: ActivityDerivedState['enhancedTransaction']
}): ReactNode {
  const { state, chainId, activityDerivedState, activityLinkUrl, disableMouseActions, creationTime, summary, enhancedTransaction } = props

  return (
    <>
      {state.isCustomRecipient && state.isCustomRecipientWarningVisible && (
        <CustomRecipientWarningBanner
          borderRadius={'12px 12px 0 0'}
          orientation={BannerOrientation.Horizontal}
          onDismiss={() => state.hideCustomRecipientWarning(state.id)}
        />
      )}
      <Summary>
        <span>
          {creationTime && <CreationTimeText>{creationTime}</CreationTimeText>}
          <ActivityVisualContent
            isOrder={state.isOrder}
            singleToken={state.singleToken}
            inputToken={state.inputToken}
            outputToken={state.outputToken}
            isBridgeOrder={state.isBridgeOrder}
            order={state.order}
            swapAndBridgeContext={state.swapAndBridgeContext}
            swapAndBridgeOverview={state.swapAndBridgeOverview}
          />
        </span>

        <SummaryInner>
          <ActivityDetailsContent
            isOrder={state.isOrder}
            order={state.order}
            isBridgeOrder={state.isBridgeOrder}
            activityName={state.activityName}
            orderBasicDetails={state.orderBasicDetails}
            hooksDetails={state.hooksDetails}
            orderSummary={state.orderSummary}
            isOrderFulfilled={state.isOrderFulfilled}
            rateInfoParams={state.rateInfoParams}
            isCancelled={activityDerivedState.isCancelled}
            isExpired={activityDerivedState.isExpired}
            isCustomRecipient={state.isCustomRecipient}
            isCustomRecipientWarningVisible={state.isCustomRecipientWarningVisible}
            receiverEnsName={state.receiverEnsName}
            chainId={chainId}
            surplusAmount={state.surplusAmount}
            surplusToken={state.surplusToken}
            showFiatValue={state.showFiatValue}
            surplusFiatValue={state.surplusFiatValue}
            swapAndBridgeContext={state.swapAndBridgeContext}
            swapResultContext={state.swapResultContext}
            swapAndBridgeOverview={state.swapAndBridgeOverview}
            summary={summary}
            id={state.id}
            RegularOrderLayout={RegularOrderLayout}
          />

          {activityLinkUrl && enhancedTransaction?.replacementType !== 'replaced' && (
            <ActivityLink href={activityLinkUrl} disableMouseActions={disableMouseActions}>
              View details ↗
            </ActivityLink>
          )}
          <GnosisSafeTxDetails chainId={chainId} activityDerivedState={activityDerivedState} />
        </SummaryInner>

        <StatusDetails
          chainId={chainId}
          showCancellationModal={state.showCancellationModal}
          activityDerivedState={state.enhancedActivityDerivedState}
          showProgressBar={state.showProgressBarCallback}
        />
      </Summary>

      <EthFlowStepper order={state.order} />
    </>
  )
}

export function ActivityDetails(props: {
  chainId: number
  activityDerivedState: ActivityDerivedState
  activityLinkUrl: string | undefined
  disableMouseActions: boolean | undefined
  creationTime?: string | undefined
}): ReactNode | null {
  const { activityDerivedState, chainId, activityLinkUrl, disableMouseActions, creationTime } = props
  const { summary, enhancedTransaction } = activityDerivedState
  const { disableProgressBar } = useInjectedWidgetParams()
  const state = useActivityDetailsState({ chainId, activityDerivedState, disableProgressBar })

  if (!state.order && !enhancedTransaction) return null

  return (
    <ActivityDetailsMain
      state={state}
      chainId={chainId}
      activityDerivedState={activityDerivedState}
      activityLinkUrl={activityLinkUrl}
      disableMouseActions={disableMouseActions}
      creationTime={creationTime}
      summary={summary}
      enhancedTransaction={enhancedTransaction}
    />
  )
}