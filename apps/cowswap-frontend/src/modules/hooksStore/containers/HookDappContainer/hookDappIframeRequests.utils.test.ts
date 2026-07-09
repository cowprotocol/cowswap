import {
  getValidatedIframeAddHookRequest,
  getValidatedIframeEditHookRequest,
  getValidatedIframeTokenAddress,
} from './hookDappIframeRequests.utils'

const VALID_HOOK = {
  target: '0x0000000000000000000000000000000000000001',
  callData: '0x1234',
  gasLimit: '21000',
}

describe('hookDappIframeRequests.utils', () => {
  describe('getValidatedIframeAddHookRequest', () => {
    it('accepts a valid add-hook payload when not editing', () => {
      expect(getValidatedIframeAddHookRequest({ hook: VALID_HOOK })).toEqual({
        type: 'add',
        payload: { hook: { ...VALID_HOOK, target: '0x0000000000000000000000000000000000000001' } },
      })
    })

    it('rejects malformed payloads', () => {
      expect(getValidatedIframeAddHookRequest({ hook: { target: VALID_HOOK.target } })).toBeNull()
      expect(getValidatedIframeAddHookRequest(null)).toBeNull()
    })

    it('rejects semantically invalid hook payloads', () => {
      expect(
        getValidatedIframeAddHookRequest({
          hook: {
            ...VALID_HOOK,
            target: 'not-an-address',
          },
        }),
      ).toBeNull()

      expect(
        getValidatedIframeAddHookRequest({
          hook: {
            ...VALID_HOOK,
            gasLimit: '0',
          },
        }),
      ).toBeNull()

      expect(
        getValidatedIframeAddHookRequest({
          hook: {
            ...VALID_HOOK,
            callData: '0x123',
          },
        }),
      ).toBeNull()

      expect(
        getValidatedIframeAddHookRequest({
          hook: {
            ...VALID_HOOK,
            callData: new String(VALID_HOOK.callData),
          },
        }),
      ).toBeNull()
    })

    it('rejects add-hook requests while editing an existing hook', () => {
      expect(getValidatedIframeAddHookRequest({ hook: VALID_HOOK }, 'hook-1')).toBeNull()
    })
  })

  describe('getValidatedIframeEditHookRequest', () => {
    it('accepts a valid edit-hook payload for the current hook', () => {
      expect(getValidatedIframeEditHookRequest({ uuid: 'hook-1', hook: VALID_HOOK }, 'hook-1')).toEqual({
        type: 'edit',
        payload: {
          uuid: 'hook-1',
          hook: { ...VALID_HOOK, target: '0x0000000000000000000000000000000000000001' },
        },
      })
    })

    it('rejects edit-hook requests for a different hook id', () => {
      expect(getValidatedIframeEditHookRequest({ uuid: 'hook-2', hook: VALID_HOOK }, 'hook-1')).toBeNull()
    })

    it('rejects edit-hook requests when there is no hook being edited', () => {
      expect(getValidatedIframeEditHookRequest({ uuid: 'hook-1', hook: VALID_HOOK })).toBeNull()
    })
  })

  describe('getValidatedIframeTokenAddress', () => {
    it('returns a checksummed token address for valid requests', () => {
      expect(getValidatedIframeTokenAddress({ address: VALID_HOOK.target })).toBe(
        '0x0000000000000000000000000000000000000001',
      )
    })

    it('rejects malformed token requests', () => {
      expect(getValidatedIframeTokenAddress({ address: 'bad' })).toBeNull()
      expect(getValidatedIframeTokenAddress({})).toBeNull()
    })
  })
})
