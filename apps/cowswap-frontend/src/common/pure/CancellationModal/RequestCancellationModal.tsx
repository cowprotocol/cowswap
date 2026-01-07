import { ReactElement, useState } from 'react'

import { ButtonPrimary } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary, TokenAmount, UI } from '@cowprotocol/ui'
import { LinkStyledButton } from '@cowprotocol/ui'
import type { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { ArrowLeft, ArrowRight } from 'react-feather'
import styled from 'styled-components/macro'

import NotificationBanner from 'legacy/components/NotificationBanner'
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
