import { ReactNode } from 'react'

import { AppDataInfo } from 'modules/appData'
import { ConfirmDetailsItem } from 'modules/trade'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'

import { SummaryInnerRow } from '../styled'

interface HooksDetailsProps {
  fullAppData: string | AppDataInfo | null | undefined
}

export function HooksDetails({ fullAppData }: HooksDetailsProps): ReactNode | null {
  return fullAppData ? (
    <OrderHooksDetails appData={fullAppData} margin="10px 0 0">
      {(children) => (
        <SummaryInnerRow>
          <b>Hooks</b>
          <i>{children}</i>
        </SummaryInnerRow>
      )}
    </OrderHooksDetails>
  ) : null
}

interface OrderBasicDetailsProps {
  rateInfoParams: RateInfoParams
  validTo: string | undefined
}

export function OrderBasicDetails({ rateInfoParams, validTo }: OrderBasicDetailsProps): ReactNode {
  return (
    <>
      <ConfirmDetailsItem withTimelineDot label="Limit price">
        <span>
          <RateInfo noLabel rateInfoParams={rateInfoParams} />
        </span>
      </ConfirmDetailsItem>
      <ConfirmDetailsItem withTimelineDot label="Valid to">
        <span>{validTo}</span>
      </ConfirmDetailsItem>
    </>
  )
}
