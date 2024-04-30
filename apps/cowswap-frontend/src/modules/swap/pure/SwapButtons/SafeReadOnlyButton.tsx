import React, { useCallback, useState } from 'react'

import { ButtonPrimary, ButtonSize, TooltipText } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { HelpCircle } from 'react-feather'
import styled from 'styled-components/macro'

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

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
        <TooltipText
          show={show}
          text={
            <div>
              Your Safe is not connected with a signer.
              <br />
              To place an order, you must connect using a signer of the Safe and refresh the page.
            </div>
          }
        >
          <Container>
            <Trans>Connect signer</Trans>
            <HelpCircle size={18} />
          </Container>
        </TooltipText>
      </ButtonPrimary>
    </div>
  )
}
