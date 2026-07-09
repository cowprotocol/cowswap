import {
  legacyToNew,
  prefixFromAssetPath,
  replaceIdentifierOutsideStrings,
  transformFile,
} from './rename-svg-import-bindings.mjs'

const CHECK = '✓'
const CROSS = '✗'

let failures = 0

function report(name, ok, details = '') {
  if (ok) {
    console.log(`${CHECK} ${name}`)
    return
  }

  failures++
  console.error(`${CROSS} ${name}`)
  if (details) console.error(`   ${details}`)
}

function expectEqual(name, actual, expected) {
  report(name, actual === expected, `expected: ${expected}\n   actual:   ${actual}`)
}

function run() {
  console.log('Running rename-svg-import-bindings self-tests...\n')

  expectEqual('prefix: icon from path hint', prefixFromAssetPath('/assets/icon-social-x.svg'), 'icon')
  expectEqual('prefix: svg from generic svg file', prefixFromAssetPath('/assets/images/hero-banner.svg'), 'svg')
  expectEqual('prefix: svg from path hint', prefixFromAssetPath('/assets/svg-set/brand-mark.svg'), 'svg')
  expectEqual('prefix: default to svg for .svg files', prefixFromAssetPath('/assets/brand-mark.svg'), 'svg')

  expectEqual('legacy: old icon name can become svg', legacyToNew('iconSearch', '/assets/search.svg'), 'svgSearchSrc')
  expectEqual('legacy: old image name becomes svg', legacyToNew('imageHero', '/assets/images/hero.svg'), 'svgHeroSrc')
  expectEqual('legacy: old svg name keeps svg', legacyToNew('svgBadge', '/assets/svg/badge.svg'), 'svgBadgeSrc')
  expectEqual(
    'legacy: CONSTANT_STYLE uses filename tail with icon prefix',
    legacyToNew('COW_PROTOCOL_LOGO', '/assets/icons/cow.svg'),
    'iconCowSrc',
  )

  const replaced = replaceIdentifierOutsideStrings(
    "const a = iconSearch\nconst b = 'iconSearch'\n// iconSearch\n",
    'iconSearch',
    'svgSearchSrc',
  )
  expectEqual(
    'replace: updates code but not strings/comments',
    replaced,
    "const a = svgSearchSrc\nconst b = 'iconSearch'\n// iconSearch\n",
  )

  const transformed = transformFile(
    "import iconSearch from 'assets/search.svg'\nconst img = iconSearch\nconst text = 'iconSearch'\n",
  )
  expectEqual(
    'transform: rewrites import + references',
    transformed,
    "import svgSearchSrc from 'assets/search.svg'\nconst img = svgSearchSrc\nconst text = 'iconSearch'\n",
  )

  const transformedLogo = transformFile("import imageEtherscanSrc from 'assets/img/etherscan-logo.svg'\n")
  expectEqual(
    'transform: uses "svg" prefix for non-icon svg and removes generic "logo" token',
    transformedLogo,
    "import svgEtherscanSrc from 'assets/img/etherscan-logo.svg'\n",
  )

  const transformedImgArrow = transformFile(
    "import imageImgIconArrowRightSrc from '@cowprotocol/assets/images/arrow-right.svg'\n",
  )
  expectEqual(
    'transform: removes redundant img/icon tokens and normalizes to svg prefix',
    transformedImgArrow,
    "import svgArrowRightSrc from '@cowprotocol/assets/images/arrow-right.svg'\n",
  )

  const transformedIconMinus = transformFile(
    "import iconImgIconMinusSrc from '@cowprotocol/assets/images/icon-minus.svg'\n",
  )
  expectEqual(
    'transform: keeps icon token from filename and drops redundant img token',
    transformedIconMinus,
    "import iconMinusSrc from '@cowprotocol/assets/images/icon-minus.svg'\n",
  )

  const transformedTemplateInterpolation = transformFile(
    "import IMAGE_BACKGROUND_DARK from '@cowprotocol/assets/images/background-cowswap-darkmode.svg'\n" +
      'const styles = `background: url(${IMAGE_BACKGROUND_DARK}) no-repeat;`\n',
  )
  expectEqual(
    'transform: replaces identifiers used inside template interpolation',
    transformedTemplateInterpolation,
    "import svgBackgroundCowswapDarkmodeSrc from '@cowprotocol/assets/images/background-cowswap-darkmode.svg'\n" +
      'const styles = `background: url(${svgBackgroundCowswapDarkmodeSrc}) no-repeat;`\n',
  )

  const transformedSameBasenameCollision = transformFile(
    "import CowDark from '@cowprotocol/assets/images/404/swap/dark/cow.svg'\n" +
      "import CowLight from '@cowprotocol/assets/images/404/swap/light/cow.svg'\n",
  )
  expectEqual(
    'transform: avoids collisions for same filename in different folders',
    transformedSameBasenameCollision,
    "import svgCowDarkSrc from '@cowprotocol/assets/images/404/swap/dark/cow.svg'\n" +
      "import svgCowLightSrc from '@cowprotocol/assets/images/404/swap/light/cow.svg'\n",
  )

  const transformedWalletAssets = transformFile(
    "import CoinbaseWalletIcon from './api/assets/coinbase.svg'\n" +
      "import MetaMaskLogo from './api/assets/metamask.png'\n" +
      "import WalletConnectIcon from './api/assets/walletConnectIcon.svg'\n" +
      '\n' +
      'export { CoinbaseWalletIcon, WalletConnectIcon, MetaMaskLogo }\n',
  )
  expectEqual(
    'transform: updates asset imports and export bindings in wallet assets re-export file',
    transformedWalletAssets,
    "import svgCoinbaseSrc from './api/assets/coinbase.svg'\n" +
      "import imgMetamaskSrc from './api/assets/metamask.png'\n" +
      "import iconWalletConnectSrc from './api/assets/walletConnectIcon.svg'\n" +
      '\n' +
      'export { svgCoinbaseSrc, iconWalletConnectSrc, imgMetamaskSrc }\n',
  )


  console.log('')
  if (failures === 0) {
    console.log(`${CHECK} All tests passed`)
    return
  }

  console.error(`${CROSS} ${failures} test(s) failed`)
  process.exitCode = 1
}

run()
