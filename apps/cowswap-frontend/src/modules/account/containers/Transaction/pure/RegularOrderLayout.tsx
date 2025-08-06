import { ReactNode } from 'react'

import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'
import { ActivityDerivedState } from 'common/types/activity'

import { ActivityRecipientRow } from './ActivityRecipientRow'
import { FromToSection } from './FromToSection'
import { SurplusRow } from './SurplusRow'
import { TimingSection } from './TimingSection'

import { SummaryInnerRow } from '../styled'

export function RegularOrderLayout({
  kind,
  from,
  to,
  isOrderFulfilled,
  rateInfoParams,
  fulfillmentTime,
  validTo,
  isCancelled,
  isExpired,
  order,
  isCustomRecipient,
  isCustomRecipientWarningVisible,
  receiverEnsName,
  chainId,
  surplusAmount,
  surplusToken,
  showFiatValue,
  surplusFiatValue,
  hooksDetails,
}: {
  kind?: string
  from: ReactNode
  to: ReactNode
  isOrderFulfilled: boolean
  rateInfoParams: RateInfoParams
  fulfillmentTime: string | undefined
  validTo: string | undefined
  isCancelled: boolean
  isExpired: boolean
  order: ActivityDerivedState['order']
  isCustomRecipient: boolean
  isCustomRecipientWarningVisible: boolean
  receiverEnsName: string | null | undefined
  chainId: number
  surplusAmount: SurplusData['surplusAmount']
  surplusToken: SurplusData['surplusToken']
  showFiatValue: boolean
  surplusFiatValue: SurplusData['surplusFiatValue']
  hooksDetails: ReactNode
}): ReactNode {
  return (
    <>
      <FromToSection kind={kind} from={from} to={to} />
      <SummaryInnerRow>
        <b>{isOrderFulfilled ? 'Exec. price' : 'Limit price'}</b>
        <i>
          <RateInfo noLabel rateInfoParams={rateInfoParams} />
        </i>
      </SummaryInnerRow>
      <TimingSection
        fulfillmentTime={fulfillmentTime}
        validTo={validTo}
        isCancelled={isCancelled}
        isExpired={isExpired}
      />
      <ActivityRecipientRow
        order={order}
        isCustomRecipient={isCustomRecipient}
        isCustomRecipientWarningVisible={isCustomRecipientWarningVisible}
        receiverEnsName={receiverEnsName}
        chainId={chainId}
      />
      <SurplusRow
        surplusAmount={surplusAmount}
        surplusToken={surplusToken}
        showFiatValue={showFiatValue}
        surplusFiatValue={surplusFiatValue}
      />
      {hooksDetails}
    </>
  )
}
