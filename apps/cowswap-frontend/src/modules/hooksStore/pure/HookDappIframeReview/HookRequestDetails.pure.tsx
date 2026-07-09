import { ReactNode } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import * as styledEl from './HookDappIframeReview.styled'

interface HookRequestDetailsProps {
  actionLabel: string
  calldata: string
  dappName: string
  dappUrl: string
  gasLimit: string
  recipientOverride?: string
  target: string
  targetLink: string
}

export function HookRequestDetails(props: HookRequestDetailsProps): ReactNode {
  const { actionLabel, calldata, dappName, dappUrl, gasLimit, recipientOverride, target, targetLink } = props

  return (
    <styledEl.DetailsTable>
      <tbody>
        <tr>
          <td>
            <Trans>Action</Trans>
          </td>
          <td>
            <styledEl.Value>{actionLabel}</styledEl.Value>
          </td>
        </tr>
        <tr>
          <td>
            <Trans>Dapp</Trans>
          </td>
          <td>
            <styledEl.Value>{dappName}</styledEl.Value>
          </td>
        </tr>
        <tr>
          <td>
            <Trans>Source</Trans>
          </td>
          <td>
            <styledEl.ExternalValueLink href={dappUrl}>{dappUrl} ↗</styledEl.ExternalValueLink>
          </td>
        </tr>
        <tr>
          <td>
            <Trans>Target</Trans>
          </td>
          <td>
            <styledEl.ExternalValueLink href={targetLink}>{target} ↗</styledEl.ExternalValueLink>
          </td>
        </tr>
        <tr>
          <td>
            <Trans>Gas limit</Trans>
          </td>
          <td>
            <styledEl.Value>{gasLimit}</styledEl.Value>
          </td>
        </tr>
        {recipientOverride && (
          <tr>
            <td>
              <Trans>Recipient override</Trans>
            </td>
            <td>
              <styledEl.Value>{recipientOverride}</styledEl.Value>
            </td>
          </tr>
        )}
        <tr>
          <td>
            <styledEl.LabelWithAction>
              <Trans>Calldata</Trans>
              <styledEl.CopyCalldataButton
                value={calldata}
                timeoutMs={1500}
                iconOnly
                iconSize={16}
                copiedLabel={<Trans>Copied!</Trans>}
                aria-label={t`Copy calldata`}
              />
            </styledEl.LabelWithAction>
          </td>
          <td>
            <styledEl.CallDataValue>{calldata}</styledEl.CallDataValue>
          </td>
        </tr>
      </tbody>
    </styledEl.DetailsTable>
  )
}
