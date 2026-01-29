import type { LottieComponentProps } from 'lottie-react'

export async function loadSurprisedCowAnimation({
  isDarkMode,
}: {
  isDarkMode: boolean
}): Promise<LottieComponentProps['animationData']> {
  const animationModule = isDarkMode
    ? await import('./lottie/surprised-cow-dark.json')
    : await import('./lottie/surprised-cow.json')

  return animationModule.default
}
