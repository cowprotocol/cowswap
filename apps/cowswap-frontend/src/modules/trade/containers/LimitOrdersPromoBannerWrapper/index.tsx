import { useNavigate } from 'common/hooks/useNavigate'

import { useLimitOrdersPromoBanner } from '../../hooks/useLimitOrdersPromoBanner'
import { LimitOrdersPromoBanner } from '../../pure/LimitOrdersPromoBanner'

interface LimitOrdersPromoBannerWrapperProps {
  children?: React.ReactNode
}

export function LimitOrdersPromoBannerWrapper({ children }: LimitOrdersPromoBannerWrapperProps) {
  const { isVisible, onDismiss, isLimitOrdersTab } = useLimitOrdersPromoBanner()
  const navigate = useNavigate()

  const handleCtaClick = () => {
    // First dismiss the banner
    onDismiss()
    // Navigate to limit orders
    navigate('/limit')
  }

  // If banner is not visible and we have children, render them
  if (!isVisible && children) {
    return <>{children}</>
  }

  // If banner is not visible and we don't have children, render nothing
  if (!isVisible) {
    return null
  }

  // When banner is visible, render it with optional children
  return (
    <LimitOrdersPromoBanner onCtaClick={handleCtaClick} onDismiss={onDismiss} isLimitOrdersTab={isLimitOrdersTab}>
      {children}
    </LimitOrdersPromoBanner>
  )
}
