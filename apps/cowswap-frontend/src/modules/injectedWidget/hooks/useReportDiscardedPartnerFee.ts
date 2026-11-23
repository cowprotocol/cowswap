import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import type { PartnerFee } from '@cowprotocol/widget-lib'

import * as Sentry from '@sentry/browser'

export function useReportDiscardedPartnerFee(appCode: string | undefined, partnerFee: PartnerFee | undefined): void {
  const prevPartnerFee = usePrevious(partnerFee)

  useEffect(() => {
    if (!appCode) return

    if (prevPartnerFee && !partnerFee) {
      const sentryError = Object.assign(
        new Error(`AppCode: ${appCode}, BPS: ${prevPartnerFee.bps}, recipient: ${prevPartnerFee.recipient}`),
        {
          name: 'PartnerFeeDiscarded',
        },
      )

      Sentry.captureException(sentryError, {
        tags: {
          errorType: 'PartnerFeeDiscarded',
        },
      })
    }
  }, [appCode, partnerFee, prevPartnerFee])
}
