import { ReactElement, useState } from 'react'

import { ButtonPrimary } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { LegacyConfirmationModalContent } from 'legacy/components/TransactionConfirmationModal/LegacyConfirmationModalContent'

import { ModalTopContent } from './ModalTopContent'
import { RequestCancellationModalProps } from './types'

export function RequestCancellationModal(props: RequestCancellationModalProps): ReactElement {
  const { onDismiss, triggerCancellation, shortId, defaultType } = props

  const [type, setType] = useState(defaultType)

  return (
    <LegacyConfirmationModalContent
      title={t`Cancel order ${shortId}`}
      onDismiss={onDismiss}
      topContent={<ModalTopContent {...props} type={type} setType={setType} />}
      bottomContent={
        <ButtonPrimary onClick={() => triggerCancellation(type)}>
          <Trans>Request cancellation</Trans>
        </ButtonPrimary>
      }
    />
  )
}
