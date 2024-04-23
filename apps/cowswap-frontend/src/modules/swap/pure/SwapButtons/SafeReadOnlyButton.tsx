import React, { useCallback, useState } from 'react'

import { ButtonPrimary, ButtonSize, Tooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

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
      <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG} title="Connect signer">
        <Tooltip
          show={show}
          text={
            <p>
              Your Safe is not connected with a signer.
              <br />
              To place an order, you must connect using a signer of the Safe and refresh the page.
            </p>
          }
        >
          <Trans>Connect signer</Trans>
        </Tooltip>
      </ButtonPrimary>
    </div>
  )
}
