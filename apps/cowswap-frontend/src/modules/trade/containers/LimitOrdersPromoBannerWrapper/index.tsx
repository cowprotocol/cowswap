import { ReactNode } from 'react'

import { useNavigate } from 'common/hooks/useNavigate'

import { useLimitOrdersPromoBanner } from '../../hooks/useLimitOrdersPromoBanner'
import { LimitOrdersPromoBanner } from '../../pure/LimitOrdersPromoBanner'

interface LimitOrdersPromoBannerWrapperProps {
  children?: ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function LimitOrdersPromoBannerWrapper({ children }: LimitOrdersPromoBannerWrapperProps) {
  const { shouldBeVisible, onDismiss, isLimitOrdersTab } = useLimitOrdersPromoBanner()
  const navigate = useNavigate()

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleCtaClick = () => {
    // First dismiss the banner
    onDismiss()
    // Navigate to limit orders
    navigate('/limit?skipLockScreen')
  }

  // If banner is not visible and we have children, render them
  if (!shouldBeVisible) {
    return children || null
  }

  // When banner is visible, render it with optional children
  return (
    <LimitOrdersPromoBanner onCtaClick={handleCtaClick} onDismiss={onDismiss} isLimitOrdersTab={isLimitOrdersTab} />
  )
}
