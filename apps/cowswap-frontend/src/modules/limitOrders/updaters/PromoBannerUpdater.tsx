import { useEffect } from 'react'

import { useLimitOrdersPromoBanner } from 'modules/trade'

import { useUpdateLimitOrdersRawState } from '../hooks/useLimitOrdersRawState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PromoBannerUpdater() {
  const updateLimitOrdersRawState = useUpdateLimitOrdersRawState()
  const { isVisible } = useLimitOrdersPromoBanner()

  useEffect(() => {
    if (!isVisible) {
      updateLimitOrdersRawState({ isUnlocked: true })
    }
  }, [isVisible, updateLimitOrdersRawState])

  return null
}
