import { readdirSync, readFileSync } from 'fs'
import { join, relative, sep } from 'path'

/**
 * The graffiti wall is a launch campaign, built to be deleted (see docs/graffiti/REMOVAL.md).
 * It owns `pages/graffiti`, `modules/graffitiWall` and `apps/graffiti-api`; everywhere else it
 * is a handful of call sites, and this list is what removing it will cost. Adding a file here
 * is a deliberate act: do it together with the table in REMOVAL.md, in the same PR.
 */
const ALLOWED_OUTSIDE_THE_FEATURE = [
  'apps/cowswap-frontend/src/common/constants/banners.ts',
  'apps/cowswap-frontend/src/common/constants/routes.ts',
  'apps/cowswap-frontend/src/modules/application/containers/App/RoutesApp.tsx',
  'apps/cowswap-frontend/src/modules/application/containers/App/menuConsts.test.ts',
  'apps/cowswap-frontend/src/modules/application/containers/App/menuConsts.tsx',
  'apps/cowswap-frontend/src/modules/application/containers/App/styled.test.tsx',
  'apps/cowswap-frontend/src/modules/application/containers/App/styled.ts',
  'apps/cowswap-frontend/src/modules/application/containers/AppContainer/AppContainer.container.tsx',
  'apps/cowswap-frontend/src/modules/application/containers/AppContainer/CowSpeechBubble/CowSpeechBubble.types.ts',
  'apps/cowswap-frontend/src/modules/application/containers/AppContainer/CowSpeechBubble/CowSpeechBubbleGraffitiWallBanner.tsx',
  'apps/cowswap-frontend/src/modules/application/containers/AppMenu/index.tsx',
  'apps/cowswap-frontend/src/modules/application/hooks/useAppTheme.ts',
  'libs/common-hooks/src/useFeatureFlags.ts',
  'libs/ui/src/types.ts',
]

const REPO_ROOT = join(__dirname, '..', '..', '..', '..', '..')
const SCANNED_ROOTS = ['apps/cowswap-frontend/src', 'libs']
const FEATURE_ROOTS = ['apps/cowswap-frontend/src/pages/graffiti', 'apps/cowswap-frontend/src/modules/graffitiWall']
const SOURCE_FILE = /\.tsx?$/
const MENTIONS_THE_FEATURE = /graffiti/i

describe('graffiti wall containment', () => {
  it('stays inside its own directories, bar the call sites listed for removal', () => {
    const found = SCANNED_ROOTS.flatMap((root) => sourceFilesUnder(join(REPO_ROOT, root)))
      .map((path) => relative(REPO_ROOT, path).split(sep).join('/'))
      .filter((path) => !FEATURE_ROOTS.some((root) => path.startsWith(`${root}/`)))
      .filter((path) => MENTIONS_THE_FEATURE.test(readFileSync(join(REPO_ROOT, path), 'utf8')))

    expect(found.sort()).toEqual([...ALLOWED_OUTSIDE_THE_FEATURE].sort())
  })
})

function sourceFilesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)

    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : sourceFilesUnder(path)

    return SOURCE_FILE.test(entry.name) ? [path] : []
  })
}
