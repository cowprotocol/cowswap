import { TradeType, type CowAuthWrapperConfig } from '@cowprotocol/widget-lib'

import { validateAuthWrapper } from './validateAuthWrapper'

const WRAPPER_ADDRESS = '0x1111111111111111111111111111111111111111'

const CONFIG: CowAuthWrapperConfig = {
  address: WRAPPER_ADDRESS,
  paramsType: 'SwapParams',
  paramsField: 'wrapperData',
  types: { SwapParams: [{ name: 'target', type: 'address' }] },
  params: { target: WRAPPER_ADDRESS },
}

describe('validateAuthWrapper', () => {
  it('passes an absent config through', () => {
    expect(validateAuthWrapper(undefined)).toBeUndefined()
  })

  it('accepts a valid config', () => {
    expect(validateAuthWrapper(CONFIG)).toBeUndefined()
  })

  /** A per-network map may carry a hole, e.g. `{ 1: config, 100: undefined }`. */
  it('reports an empty entry in a per-network config', () => {
    expect(validateAuthWrapper({ 1: undefined })).toEqual(['Auth wrapper config must not be empty!'])
  })

  it('validates every entry of a per-network config', () => {
    const errors = validateAuthWrapper({ 1: CONFIG, 100: { ...CONFIG, address: 'nope' } })

    expect(errors).toHaveLength(1)
    expect(errors?.[0]).toContain('is not a valid address')
  })

  it('validates every entry of a per-trade-type config', () => {
    const errors = validateAuthWrapper({
      [TradeType.SWAP]: CONFIG,
      [TradeType.LIMIT]: { ...CONFIG, paramsType: 'WrapperParams', types: { WrapperParams: CONFIG.types.SwapParams } },
    })

    expect(errors).toHaveLength(1)
    expect(errors?.[0]).toContain('must sort alphabetically before "WrapperAndAppData"')
  })

  /**
   * Params that do not encode against the declared types surface as viem errors rather
   * than as our own; they must still block the widget, not slip through.
   */
  it('reports params that do not match the declared types', () => {
    const errors = validateAuthWrapper({ ...CONFIG, params: { target: 'not-an-address' } })

    expect(errors).toHaveLength(1)
    expect(errors?.[0]).toContain('"params" do not match the declared "types"')
  })

  it('reports a missing params value', () => {
    const errors = validateAuthWrapper({ ...CONFIG, params: {} })

    expect(errors).toHaveLength(1)
    expect(errors?.[0]).toContain('"params" do not match the declared "types"')
  })
})
