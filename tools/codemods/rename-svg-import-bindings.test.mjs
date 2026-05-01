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
  expectEqual('prefix: image from path hint', prefixFromAssetPath('/assets/images/hero-banner.svg'), 'image')
  expectEqual('prefix: svg from path hint', prefixFromAssetPath('/assets/svg-set/brand-mark.svg'), 'svg')
  expectEqual('prefix: default to image', prefixFromAssetPath('/assets/brand-mark.svg'), 'image')

  expectEqual('legacy: old icon name can become image', legacyToNew('iconSearch', '/assets/search.svg'), 'imageSearchSrc')
  expectEqual('legacy: old image name keeps image', legacyToNew('imageHero', '/assets/images/hero.svg'), 'imageHeroSrc')
  expectEqual('legacy: old svg name keeps svg', legacyToNew('svgBadge', '/assets/svg/badge.svg'), 'svgBadgeSrc')
  expectEqual(
    'legacy: CONSTANT_STYLE gets prefixed by path hint',
    legacyToNew('COW_PROTOCOL_LOGO', '/assets/icons/cow.svg'),
    'iconCowProtocolLogoSrc',
  )

  const replaced = replaceIdentifierOutsideStrings(
    "const a = iconSearch\nconst b = 'iconSearch'\n// iconSearch\n",
    'iconSearch',
    'imageSearchSrc',
  )
  expectEqual(
    'replace: updates code but not strings/comments',
    replaced,
    "const a = imageSearchSrc\nconst b = 'iconSearch'\n// iconSearch\n",
  )

  const transformed = transformFile(
    "import iconSearch from 'assets/search.svg'\nconst img = iconSearch\nconst text = 'iconSearch'\n",
  )
  expectEqual(
    'transform: rewrites import + references',
    transformed,
    "import imageSearchSrc from 'assets/search.svg'\nconst img = imageSearchSrc\nconst text = 'iconSearch'\n",
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
