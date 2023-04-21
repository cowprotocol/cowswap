import deterministicHash from './deterministicHash'

describe('deterministicHash', () => {
  it('correctly generates the sha256 of an object', () => {
    const doc = {
      version: '1.0.0',
      appCode: 'CoW Swap',
      metadata: {
        referrer: {
          kind: 'referrer',
          referrer: '0x1811be0994930fE9480eAEDe25165608B093ad7A',
          version: '1.0.0',
        },
      },
    }

    expect(deterministicHash(doc)).toBe('0xb2fd9de6391637033411986be9ff8549a3902456d2517cd9c5acad427b332fdb')
  })
  it('always generates the same sha256 of an object no matter the order of the properties', () => {
    const doc1 = {
      version: '1.0.0',
      appCode: 'CoW Swap',
      metadata: {
        referrer: {
          kind: 'referrer',
          referrer: '0x1811be0994930fE9480eAEDe25165608B093ad7A',
          version: '1.0.0',
        },
      },
    }
    const doc2 = {
      appCode: 'CoW Swap',
      version: '1.0.0',
      metadata: {
        referrer: {
          version: '1.0.0',
          kind: 'referrer',
          referrer: '0x1811be0994930fE9480eAEDe25165608B093ad7A',
        },
      },
    }

    expect(deterministicHash(doc1)).toBe(deterministicHash(doc2))
  })
})
