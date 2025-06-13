const nxPreset = require('@nx/jest/preset').default

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    '\\.svg': '<rootDir>../../testing/svgrMock.js',
    '\\.gif': '<rootDir>../../testing/imgMock.js',
    '\\.webp': '<rootDir>../../testing/imgMock.js',
    '\\.woff': '<rootDir>../../testing/imgMock.js',
    '\\.woff2': '<rootDir>../../testing/imgMock.js',
    '\\.png': '<rootDir>../../testing/imgMock.js',
  },
}
