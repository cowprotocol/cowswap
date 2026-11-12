import { AI_GUIDELINES, aiPrompt, originalFilename } from './aiHelp.utils'
import { LogoAsset } from './solverLogoTool.types'

it('includes the original source, current settings and required deliverables without a reference URL', () => {
  const source: LogoAsset = {
    name: 'brand source.svg',
    type: 'svg',
    width: 1000,
    height: 800,
    bytes: new Uint8Array(),
    svg: '',
    image: new Image(),
    url: '',
    inkPoints: [],
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    dispose: jest.fn(),
  }
  const prompt = aiPrompt({ name: 'Dfusion', asset: source, state: { scale: 70, x: 10, y: -5, background: '#ffffff' } })
  for (const value of [
    'original/brand-source.svg',
    '1000 × 800',
    'size 70%',
    'X 10%',
    'Y -5%',
    'background #ffffff',
    'guidelines.md',
    'examples/context-reference.png',
    'examples/positioning-guide.png',
    'downloadable ZIP',
    'cannot inspect attachments',
  ])
    expect(prompt).toContain(value)
  expect(prompt + AI_GUIDELINES).not.toMatch(/https?:\/\/|figma\.com/i)
  expect(AI_GUIDELINES).toContain('Never wrap a PNG in SVG')
})

it.each(['../../logo.svg', '..', '/logo.png', 'a\\b.svg', ''])(
  'keeps original filenames inside their archive folder: %s',
  (name) => {
    const safe = originalFilename({ name, type: 'svg' })
    expect(safe.length).toBeGreaterThan(0)
    expect(safe).not.toMatch(/^[.]|[/\\]/)
  },
)
