import { getMainMenu } from '../../components/common/MenuDropdown/mainMenu'
import { MenuItemKind } from '../../components/common/MenuDropdown/types'

function getOtherSectionLinkTitles(isSolversEnabled: boolean): string[] {
  const menu = getMainMenu(isSolversEnabled)
  const moreItem = menu.find((item) => item.kind === MenuItemKind.DROP_DOWN)

  if (!moreItem || moreItem.kind !== MenuItemKind.DROP_DOWN) {
    return []
  }

  return moreItem.items.find((item) => item.sectionTitle === 'OTHER')?.links.map((link) => link.title) || []
}

describe('getMainMenu', () => {
  it('includes the Solvers link when the feature is enabled', () => {
    expect(getOtherSectionLinkTitles(true)).toEqual(['Solvers', 'AppData'])
  })

  it('removes the Solvers link when the feature is disabled', () => {
    expect(getOtherSectionLinkTitles(false)).toEqual(['AppData'])
  })
})
