import { ReactNode } from 'react'

import { AppDataInfo } from 'modules/appData'
import { ConfirmDetailsItem } from 'modules/trade'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'

import { SummaryInnerRow } from '../styled'

export function createHooksDetails(fullAppData: string | AppDataInfo | null | undefined): ReactNode | null {
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

export function createOrderBasicDetails(rateInfoParams: RateInfoParams, validTo: string | undefined): ReactNode {
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
