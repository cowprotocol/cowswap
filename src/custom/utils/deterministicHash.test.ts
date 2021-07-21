import deterministicHash from './deterministicHash'

describe('deterministicHash', () => {
  it('correctly generates the sha256 of an object', () => {
    const doc = {
      version: '1.0.0',
      appCode: 'CowSwap',
      metadata: {
        referrer: {
          kind: 'referrer',
          referrer: '0x1811be0994930fE9480eAEDe25165608B093ad7A',
          version: '1.0.0',
        },
      },
    }

    expect(deterministicHash(doc)).toBe('0xd5f44c18e6cc2e16023dcd145710208339bb26f6c52df20d1c2f49f3f31c7014')
  })
  it('always generates the same sha256 of an object no matter the order of the properties', () => {
    const doc1 = {
      version: '1.0.0',
      appCode: 'CowSwap',
      metadata: {
        referrer: {
          kind: 'referrer',
          referrer: '0x1811be0994930fE9480eAEDe25165608B093ad7A',
          version: '1.0.0',
        },
      },
    }
    const doc2 = {
      appCode: 'CowSwap',
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
