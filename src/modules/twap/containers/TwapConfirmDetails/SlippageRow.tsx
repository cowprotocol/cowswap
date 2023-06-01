import { useAtomValue } from 'jotai'

import { RowSlippage } from 'modules/swap/containers/Row/RowSlippage'
import { ConfirmDetailsItem } from 'modules/twap/pure/ConfirmDetailsItem'
import { twapOrderSlippage } from 'modules/twap/state/twapOrdersSettingsAtom'

export function SlippageRow() {
  const allowedSlippage = useAtomValue(twapOrderSlippage)

  return (
    <ConfirmDetailsItem>
      <RowSlippage allowedSlippage={allowedSlippage} showSettingOnClick={false} />
    </ConfirmDetailsItem>
  )
}
