import { useEffect, useState } from 'react'

import type { LottieComponentProps } from 'lottie-react'

interface UseNoOrdersAnimationParams {
  emptyOrdersImage?: string | null
  hasHydratedOrders: boolean
  isDarkMode: boolean
}

export function useNoOrdersAnimation({
  emptyOrdersImage,
  hasHydratedOrders,
  isDarkMode,
}: UseNoOrdersAnimationParams): LottieComponentProps['animationData'] | null | undefined {
  const [animationData, setAnimationData] = useState<LottieComponentProps['animationData'] | null | undefined>()

  useEffect(() => {
    if (emptyOrdersImage || !hasHydratedOrders) {
      setAnimationData(undefined)
      return
    }

    let isCancelled = false

    async function loadAnimation(): Promise<void> {
      try {
        const animationModule = isDarkMode
          ? await import('@cowprotocol/assets/lottie/surprised-cow-dark.json')
          : await import('@cowprotocol/assets/lottie/surprised-cow.json')

        if (!isCancelled) {
          setAnimationData(animationModule.default)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('[useNoOrdersAnimation] Failed to load animation', error)
          setAnimationData(null)
        }
      }
    }

    void loadAnimation()

    return () => {
      isCancelled = true
    }
  }, [emptyOrdersImage, hasHydratedOrders, isDarkMode])

  return animationData
}
