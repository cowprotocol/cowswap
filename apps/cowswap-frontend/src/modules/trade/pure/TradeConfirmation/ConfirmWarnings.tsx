import { Dispatch, ReactNode, SetStateAction } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'
import { BannerOrientation } from '@cowprotocol/ui'

import { CustomRecipientWarningBanner } from 'common/pure/CustomRecipientWarningBanner'

import { PriceUpdatedBanner } from '../PriceUpdatedBanner'
import { SmartContractReceiverWarning } from '../SmartContractReceiverWarning'

interface ConfirmWarningsProps {
  resetPriceChanged(): void
  recipient: Nullish<string>
  account: string | undefined
  ensName: string | undefined
  isPriceChanged: boolean
  isPriceStatic: boolean | undefined
  outputChainId: SupportedChainId | undefined
  smartContractRecipientConfirmState: [boolean, Dispatch<SetStateAction<boolean>>] | undefined
}

export function ConfirmWarnings({
  resetPriceChanged,
  recipient,
  account,
  ensName,
  isPriceChanged,
  isPriceStatic,
  outputChainId,
  smartContractRecipientConfirmState,
}: ConfirmWarningsProps): ReactNode {
  const showRecipientWarning =
    recipient &&
    (account || ensName) &&
    ![account?.toLowerCase(), ensName?.toLowerCase()].includes(recipient.toLowerCase())

  return (
    <>
      {showRecipientWarning && <CustomRecipientWarningBanner orientation={BannerOrientation.Horizontal} />}
      {smartContractRecipientConfirmState && account && outputChainId && (
        <SmartContractReceiverWarning
          account={account}
          recipient={recipient}
          chainId={outputChainId}
          state={smartContractRecipientConfirmState}
        />
      )}
      {isPriceChanged && !isPriceStatic && <PriceUpdatedBanner onClick={resetPriceChanged} />}
    </>
  )
}
