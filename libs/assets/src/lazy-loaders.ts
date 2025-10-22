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

export async function loadWalletPlusIcon(): Promise<string> {
  const iconModule = await import('./cow-swap/wallet-plus.svg')

  return iconModule.default
}
