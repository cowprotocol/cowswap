import { Category, reportEvent } from './index'

type GameType = 'Cow Runner' | 'MEV Slicer'
export function gameAnalytics(gameType: GameType) {
  reportEvent({
    category: Category.GAMES,
    action: `Playing ${gameType} game`,
  })
}
