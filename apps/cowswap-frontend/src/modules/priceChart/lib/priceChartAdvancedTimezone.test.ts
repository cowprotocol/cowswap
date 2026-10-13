import { getCustomTimezone } from './priceChartAdvancedTimezone.utils'

describe('getCustomTimezone', () => {
  it.each([
    ['Europe/Minsk', -180, 'Etc/GMT-3:0'],
    ['America/Panama', 300, 'Etc/GMT+5:0'],
    ['Asia/Kolkata', -330, 'Etc/GMT-5:30'],
    ['Asia/Kathmandu', -345, 'Etc/GMT-5:45'],
    ['UTC', 0, 'Etc/GMT+0'],
  ])('maps %s offset %s to %s', (timezone, offsetMinutes, alias) => {
    expect(getCustomTimezone(timezone, offsetMinutes)).toEqual({
      id: `${timezone}-local`,
      alias,
      title: timezone,
    })
  })
})
