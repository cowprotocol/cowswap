import { useState } from 'react'

import { ButtonSecondaryAlt } from '@cowprotocol/ui'

import { HookStoreModal } from './HookStoreModal'

export function PostHookButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <ButtonSecondaryAlt onClick={() => setOpen(true)}>Post-hook</ButtonSecondaryAlt>{' '}
      {open && <HookStoreModal onDismiss={() => setOpen(false)} />}
    </>
  )
}
