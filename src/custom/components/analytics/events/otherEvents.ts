import { Category, sendEvent } from '../index'
import { detectExplorer } from 'utils/explorer'

type GameType = 'CoW Runner' | 'MEV Slicer' | 'Super CoW Bro'
export function gameAnalytics(gameType: GameType) {
  sendEvent({
    category: Category.GAMES,
    action: `Playing ${gameType} game`,
  })
}

export function externalLinkAnalytics(href: string) {
  const explorer = detectExplorer(href)

  if (explorer) {
    sendEvent({
      category: Category.EXTERNAL_LINK,
      action: `View on ${explorer}`,
      label: href,
    })
  }
}
