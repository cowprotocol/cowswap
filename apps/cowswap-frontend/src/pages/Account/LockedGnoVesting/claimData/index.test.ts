import { fetchClaim } from '.'

describe('fetchClaim', () => {
  it('should fetch the correct amount and merkle proof for 0x01eda16f6a6c3b051ecc63b0d93c8c3a27491dc2 on mainnet', async () => {
    const claim = await fetchClaim('0x01eda16f6a6c3b051ecc63b0d93c8c3a27491dc2', 1)
    expect(claim?.amount).toEqual('0x03e7eed24f376724a0')
    expect(claim?.proof).toEqual([
      '0x60d453c5e23c77b881dd9ff7529fcf464edebd491d5ea8bf5e11e23cc6f47480',
      '0x0877e91858fac51a42947fbd26999874691a9e888cf34436fa66c0028ab7bbd3',
      '0xfe29bdb74e8f410a109fde3f458c927507e618808b8413ed1c5fd323c5c9a628',
      '0x6c650faf73c5b63f83db90a590bd33ba56643ebdc302511b31d826d19396816b',
      '0x9144ff27437147862213a49a1b7fe83f3a4f7d63a2077f282d4e950fb1fca985',
      '0x3c34f4ba3f7f0377e3cf9cf529dab73fd7ff4fe6dfbac59b69f04260b8b33cd9',
      '0x91b09c40dbce8d252add3b512793d4b3cfcbe3b46c5c9d6d56ba993ecf770470',
      '0xe97c601df9a399f368546575516b533f0438e87866e46e4694687e94d0241218',
      '0x1d6a881baea3b1685912b1f308eb9373e808fb3cfff389ffa0cec82e3eb0ea1a',
      '0xd84e4549adcf49890f091546b3f873d102368cb115fac46655102eff21a1291b',
    ])
  })

  it('should fetch the correct amount and merkle proof for 0x00645dd21310882cc32399abcb54e0a05b3b5d1d on Gnosis Chain', async () => {
    const claim = await fetchClaim('0x00645dd21310882cc32399abcb54e0a05b3b5d1d', 100)
    expect(claim?.amount).toEqual('0x58b0138dc7e4ccd980')
    expect(claim?.proof).toEqual([
      '0x65675d39883f109dec07e3d7b4613c412c81ee3311fd093cff00359e52d739c1',
      '0x9638aa10de5885b599958cddae3f3ab119f11b61d32e03741198d15c9208e7fb',
      '0xf2b9715498991ab98a9e819889268409a351b9754fca9a1b05946f45829699d6',
      '0x00c71fda7f57a05619bdc2e6260970a7b4dd726ad0b87717818c33ec28d28e6c',
      '0x7631f21c6d503b95f7eb594f0ae219b5743268dd9cbabb71956aeff8ca333083',
      '0xb54a34f057a323d8de571f623f8390c02f8d075e1613e8dc8d8c267d8cddb957',
      '0xcee373a777b7f6eb5c9b6855ce2fc88aedc4accc4bbb27371f253c23efe3fdf4',
      '0xdd4dc16f1f24d8f6f4fe323caeaa275b457b0d9340510eeb80c679b08bc94304',
      '0x20a84c8d8e7d15409c6ea4591310bdc57bebe4489b53036d10f9e0467f339600',
      '0xd0c880019076ffcd06d15b98b049e82d349323a6da4871484964e2c5b4e446a2',
      '0x4b71fa3ace335c8703d193770bcef717053532750939e342c416afef044a3eba',
    ])
  })
})
