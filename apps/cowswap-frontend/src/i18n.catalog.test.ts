import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Guards the extracted source catalog against sentence fragmentation.
 *
 * Lingui's `plural()` function macro does NOT merge into a surrounding `<Trans>`: the extractor
 * treats it as an opaque expression, emitting an unnamed `{0}` placeholder in the parent message
 * plus a separate standalone plural entry - and a `#. placeholder` comment holding the whole source
 * file. Inside JSX the `<Plural>` component must be used instead. Both forms render identical
 * English, so only the catalog reveals the difference.
 */
const catalog = readFileSync(join(__dirname, 'locales', 'en-US.po'), 'utf8')

const liveMsgIds = catalog
  .split('\n')
  .filter((line) => line.startsWith('msgid "'))
  .map((line) => line.slice('msgid "'.length, -1))

describe('en-US catalog', () => {
  it('does not leak source code into translator comments', () => {
    const leaked = catalog
      .split('\n')
      .filter((line) => line.startsWith('#. placeholder') && /\bimport\b|=>|\bfunction\b/.test(line))

    expect(leaked).toEqual([])
  })

  it('keeps count-bearing sentences in a single plural message', () => {
    const expected = [
      '{gnosisSafeThreshold, plural, one {# signature is required} few {# signatures are required} many {# signatures are required} other {# signatures are required}}',
      'Partial approval may block <0>{ordersWithPermitLength}</0> {ordersWithPermitLength, plural, one {other order} few {other orders} many {other orders} other {other orders}}',
      'Found {totalOpenOrders, plural, one {# open order} few {# open orders} many {# open orders} other {# open orders}} in the {limit} most recent ones.',
      'Code <0>{code}</0> is linked for the next {timeCapDays, plural, one {# day} few {# days} many {# days} other {# days}}',
      '{ordersCount, plural, one {Are you sure you want to cancel # order?} few {Are you sure you want to cancel # orders?} many {Are you sure you want to cancel # orders?} other {Are you sure you want to cancel # orders?}}',
    ]

    expect(expected.filter((msgId) => !liveMsgIds.includes(msgId))).toEqual([])
  })

  it('has no live message that is only a plural noun torn out of its sentence', () => {
    // A message consisting of nothing but a plural over a single word is a fragment: the translator
    // cannot see the clause it belongs to, so case and gender agreement are guesswork.
    const bareNounPlural = /^\{[A-Za-z0-9_]+, plural,(?: (?:one|two|few|many|other) \{[a-z]+\})+\}$/

    expect(liveMsgIds.filter((msgId) => bareNounPlural.test(msgId))).toEqual([])
  })
})
