import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

import { bffRateLimitedAtom } from 'entities/captcha/state/bffRateLimitedAtom'
import { captchaErrorAtom } from 'entities/captcha/state/captchaErrorAtom'
import { captchaInteractionRequiredAtom } from 'entities/captcha/state/captchaInteractionRequiredAtom'
import { captchaJwtAtom } from 'entities/captcha/state/captchaJwtAtom'
import { quoteRateLimitedUntilAtom } from 'entities/captcha/state/quoteRateLimitedUntilAtom'

import { captchaSlotAtom } from '../state/captchaSlot.atoms'

export interface CaptchaModal {
  isModalOpen: boolean
  dismissModal(): void
}

export function useCaptchaModal(): CaptchaModal {
  const captchaJwt = useAtomValue(captchaJwtAtom)
  const captchaError = useAtomValue(captchaErrorAtom)
  const isInteractionRequired = useAtomValue(captchaInteractionRequiredAtom)
  const slot = useAtomValue(captchaSlotAtom)
  const isBffRateLimited = useAtomValue(bffRateLimitedAtom)
  const quoteRateLimitedUntil = useAtomValue(quoteRateLimitedUntilAtom)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const isRateLimited = isBffRateLimited || quoteRateLimitedUntil !== null
  // A trade form shows the checkbox itself, so the interaction case only needs the modal off trade pages.
  const shouldOpen =
    isRateLimited && !captchaJwt && !isDismissed && (!!captchaError || (isInteractionRequired && !slot))
  const shouldClose = !!captchaJwt || (!!slot && !captchaError)

  // A latch rather than derived state: moving Turnstile into the modal remounts it and clears the interaction flag.
  useEffect(() => {
    if (shouldOpen) setIsModalOpen(true)
    else if (shouldClose) setIsModalOpen(false)
  }, [shouldOpen, shouldClose])

  const dismissModal = useCallback(() => {
    setIsModalOpen(false)
    setIsDismissed(true)
  }, [])

  return { isModalOpen, dismissModal }
}
