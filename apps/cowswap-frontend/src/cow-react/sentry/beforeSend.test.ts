import { ErrorEvent as SentryErrorEvent } from '@sentry/types'

import { beforeSend } from './beforeSend'

function buildEvent(overrides: Partial<SentryErrorEvent> = {}): SentryErrorEvent {
  return {
    type: undefined,
    exception: {
      values: [
        {
          type: 'Error',
          value: 'Something went wrong',
        },
      ],
    },
    ...overrides,
  } as SentryErrorEvent
}

describe('beforeSend', () => {
  it('passes through regular errors', () => {
    const event = buildEvent()
    expect(beforeSend(event, {})).toBe(event)
  })

  it('ignores network errors originating from the LaunchDarkly SDK', () => {
    const event = buildEvent({
      exception: {
        values: [
          {
            type: 'NetworkError',
            value: 'A network error occurred.',
            stacktrace: {
              frames: [
                {
                  filename:
                    '../../../node_modules/.pnpm/launchdarkly-js-client-sdk@3.1.3/node_modules/launchdarkly-js-client-sdk/dist/ldclient.es.js',
                },
                { filename: '[native code]' },
              ],
            },
          },
        ],
      },
    })

    expect(beforeSend(event, {})).toBeNull()
  })

  it('does NOT ignore network errors from unrelated sources', () => {
    const event = buildEvent({
      exception: {
        values: [
          {
            type: 'NetworkError',
            value: 'A network error occurred.',
            stacktrace: {
              frames: [{ filename: '../../../node_modules/some-other-lib/dist/index.js' }],
            },
          },
        ],
      },
    })

    expect(beforeSend(event, {})).toBe(event)
  })

  it('ignores errors based on extra serialized code', () => {
    const event = buildEvent({
      extra: { __serialized__: { code: -32000, message: 'header not found' } },
    })

    expect(beforeSend(event, {})).toBeNull()
  })
})
