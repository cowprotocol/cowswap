import { getGmtCustomTimezone } from './tradingViewTimezone'

describe('getGmtCustomTimezone', () => {
  it.each([
    ['Europe/Minsk', -180, 'Etc/GMT-3', 'UTC+3'],
    ['America/Panama', 300, 'Etc/GMT+5', 'UTC-5'],
    ['Asia/Kolkata', -330, 'Etc/GMT-5:30', 'UTC+5:30'],
    ['Asia/Kathmandu', -345, 'Etc/GMT-5:45', 'UTC+5:45'],
    ['UTC', 0, 'Etc/GMT+0', 'UTC'],
  ])('maps %s offset %s to %s', (timezone, offsetMinutes, alias, title) => {
    expect(getGmtCustomTimezone(timezone, offsetMinutes)).toEqual({ id: `${timezone}-local`, alias, title })
  })
})
