import { Category, reportEvent } from './index'
import { detectExplorer } from 'utils/explorer'

type GameType = 'Cow Runner' | 'MEV Slicer'
export function gameAnalytics(gameType: GameType) {
  reportEvent({
    category: Category.GAMES,
    action: `Playing ${gameType} game`,
  })
}

export function externalLinkAnalytics(href: string) {
  const explorer = detectExplorer(href)

  if (explorer) {
    reportEvent({
      category: Category.EXTERNAL_LINK,
      action: `View on ${explorer}`,
      label: href,
    })
  }
}
