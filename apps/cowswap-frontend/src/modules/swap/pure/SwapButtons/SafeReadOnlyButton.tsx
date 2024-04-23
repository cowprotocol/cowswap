import React, { useCallback, useState } from 'react'

import { ButtonPrimary, ButtonSize, Tooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { AlertCircle } from 'react-feather'

export function SafeReadOnlyButton() {
  const [show, setShow] = useState(false)
  const [mouseLeaveTimeout, setMouseLeaveTimeout] = useState<NodeJS.Timeout | null>(null)

  const open = useCallback(() => {
    setShow(true)
    if (mouseLeaveTimeout) {
      clearTimeout(mouseLeaveTimeout)
    }
  }, [setShow, mouseLeaveTimeout])

  const close = useCallback(() => {
    const timeout = setTimeout(() => {
      setShow(false)
    }, 400)

    setMouseLeaveTimeout(timeout)
  }, [setShow])

  return (
    <div onMouseEnter={open} onMouseLeave={close}>
      <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG} title="Please, connect owner">
        <Tooltip
          show={show}
          text={
            <>
              <p>
                Your Safe is not connected with an owner, hence you are in a read-only mode and won't be able to place
                an order.
              </p>
              <p>Please, make sure the connected wallet is one of the owners of this Safe.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div>
                  <AlertCircle size={16} />
                </div>
                <div>
                  After solving the issue above, <strong>you will need to refresh the website</strong> to exit read-only
                  mode.
                </div>
              </div>
            </>
          }
        >
          <Trans>Please, connect owner </Trans>
        </Tooltip>
      </ButtonPrimary>
    </div>
  )
}
