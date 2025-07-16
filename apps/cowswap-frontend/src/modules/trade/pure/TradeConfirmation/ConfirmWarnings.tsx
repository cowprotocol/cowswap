import { ReactNode } from 'react'

import { Nullish } from '@cowprotocol/types'
import { BannerOrientation } from '@cowprotocol/ui'

import { CustomRecipientWarningBanner } from 'common/pure/CustomRecipientWarningBanner'

import { PriceUpdatedBanner } from '../PriceUpdatedBanner'

interface ConfirmWarningsProps {
  resetPriceChanged(): void
  recipient: Nullish<string>
  account: string | undefined
  ensName: string | undefined
  isPriceChanged: boolean
  isPriceStatic: boolean | undefined
}

export function ConfirmWarnings({
  resetPriceChanged,
  recipient,
  account,
  ensName,
  isPriceChanged,
  isPriceStatic,
}: ConfirmWarningsProps): ReactNode {
  const showRecipientWarning =
    recipient &&
    (account || ensName) &&
    ![account?.toLowerCase(), ensName?.toLowerCase()].includes(recipient.toLowerCase())

  return (
    <>
      {showRecipientWarning && <CustomRecipientWarningBanner orientation={BannerOrientation.Horizontal} />}
      {isPriceChanged && !isPriceStatic && <PriceUpdatedBanner onClick={resetPriceChanged} />}
    </>
  )
}
