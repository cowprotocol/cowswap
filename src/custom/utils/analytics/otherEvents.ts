import { Category, reportEvent } from './index'

type GameType = 'Cow Runner' | 'MEV Slicer'
export function gameAnalytics(gameType: GameType) {
  reportEvent({
    category: Category.GAMES,
    action: `Playing ${gameType} game`,
  })
}

function _detectExplorer(href: string) {
  if (href.includes('explorer')) {
    return 'Explorer'
  } else if (href.includes('blockscout')) {
    return 'Blockscout'
  } else {
    return undefined
  }
}

export function externalLinkAnalytics(href: string) {
  const explorer = _detectExplorer(href)

  if (explorer) {
    reportEvent({
      category: Category.EXTERNAL_LINK,
      action: `View on ${_detectExplorer(href)}`,
      label: href,
    })
  }
}
