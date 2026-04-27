export const createAppKit = jest.fn(() => ({
  setThemeMode: jest.fn(),
  updateFeatures: jest.fn(),
}))

export const useAppKit = jest.fn(() => ({
  open: jest.fn(),
  close: jest.fn(),
}))
