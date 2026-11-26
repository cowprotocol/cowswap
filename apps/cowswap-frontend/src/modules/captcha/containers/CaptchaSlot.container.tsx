import { useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import { captchaSlotAtom } from '../state/captchaSlot.atoms'

// `display: contents` keeps the slot out of the trade form's flex `gap` while it's empty.
const SLOT_STYLE = { display: 'contents' } as const

export function CaptchaSlot(): ReactNode {
  const setSlot = useSetAtom(captchaSlotAtom)

  return <div ref={setSlot} style={SLOT_STYLE} />
}
