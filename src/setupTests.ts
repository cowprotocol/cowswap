// jest custom assertions
import '@testing-library/jest-dom'
// include style rules in snapshots
import 'jest-styled-components'
// Mocks `fetch` calls in unittests
import fetchMock from 'jest-fetch-mock'

// Do not enable it by default
// Although we should, I don't want to deal with this right now
// as there are other unittests relying on network calls
fetchMock.dontMock()
