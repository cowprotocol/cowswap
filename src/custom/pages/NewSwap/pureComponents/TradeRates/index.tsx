import React from 'react'
import * as styledEl from './styled'
import { PriceSwitchButton } from './styled'
import { InfoIcon } from 'components/InfoIcon'
import { SUBSIDY_INFO_MESSAGE } from 'components/CowSubsidyModal/constants'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from '@src/state/application/reducer'

const GASLESS_FEE_TOOLTIP_MSG =
  'On CoW Swap you sign your order (hence no gas costs!). The fees are covering your gas costs already.'

const SUBSIDY_INFO_MESSAGE_EXTENDED =
  SUBSIDY_INFO_MESSAGE + '. Click on the discount button on the right for more info.'

// TODO: implement clicks
export function TradeRates() {
  const openCowSubsidyModal = useOpenModal(ApplicationModal.COW_SUBSIDY)

  return (
    <styledEl.Box>
      <styledEl.Row>
        <div>
          <span>Price</span> <PriceSwitchButton size={20} />
        </div>
        <div>
          <span>
            <styledEl.LightText>1 USDC</styledEl.LightText> = 1.0002 WXDAI{' '}
            <styledEl.LightText>(≈$0.99)</styledEl.LightText>
          </span>
        </div>
      </styledEl.Row>
      <styledEl.Row>
        <div>
          <span>Fees (incl. gas costs)</span>
          <InfoIcon content={GASLESS_FEE_TOOLTIP_MSG} />
        </div>
        <div>
          <span>
            0.0007 USDC <styledEl.LightText>({'≈$ <0.01'})</styledEl.LightText>
          </span>
        </div>
      </styledEl.Row>
      <styledEl.Row>
        <div>
          <span>Fees discount</span>
          <InfoIcon content={SUBSIDY_INFO_MESSAGE_EXTENDED} />
        </div>
        <div>
          <styledEl.Discount onClick={openCowSubsidyModal}>0% discount</styledEl.Discount>
        </div>
      </styledEl.Row>
    </styledEl.Box>
  )
}
