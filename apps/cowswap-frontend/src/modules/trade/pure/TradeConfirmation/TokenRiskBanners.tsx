import { ReactNode } from 'react'

import { TokenRiskConfirmBanner } from 'common/containers/TokenRisk'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'

interface TokenRiskBannersProps {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
}

export function TokenRiskBanners({ inputCurrencyInfo, outputCurrencyInfo }: TokenRiskBannersProps): ReactNode {
  return (
    <>
      <TokenRiskConfirmBanner currency={inputCurrencyInfo.amount?.currency} />
      <TokenRiskConfirmBanner currency={outputCurrencyInfo.amount?.currency} />
    </>
  )
}
