/**
 * @jest-environment ./custom-test-env.js
 */

// include style rules in snapshots
import 'jest-styled-components'
import { fireEvent, render, screen } from 'test-utils'
import { ResizingTextArea, TextInput } from './'
import { useLocation } from 'react-router-dom'

jest.mock('react-router-dom', () => {
  return {
    ...(jest.requireActual('react-router-dom') as any),
    useLocation: jest.fn(),
  }
})

describe('TextInput', () => {
  beforeEach(() => {
    const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>
    mockUseLocation.mockImplementation(() => ({ pathname: '/swap' } as any))
  })

  it('renders correctly', () => {
    const { asFragment } = render(
      <TextInput
        className="testing"
        value="My test input"
        onUserInput={() => null}
        placeholder="Test Placeholder"
        fontSize="12"
      />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('calls the handler on user input', () => {
    const onUserInputSpy = jest.fn()
    render(
      <TextInput
        className="testing"
        value=""
        onUserInput={onUserInputSpy}
        placeholder="Test Placeholder"
        fontSize="12"
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Test Placeholder'), { target: { value: 'New value' } })

    expect(onUserInputSpy).toHaveBeenCalledWith('New value')
    expect(onUserInputSpy).toHaveBeenCalledTimes(1)
  })
})

describe('ResizableTextArea', () => {
  beforeEach(() => {
    const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>
    mockUseLocation.mockImplementation(() => ({ pathname: '/swap' } as any))
  })

  it('renders correctly', () => {
    const { asFragment } = render(
      <ResizingTextArea
        className="testing"
        value="My test input"
        onUserInput={() => null}
        placeholder="Test Placeholder"
        fontSize="12"
      />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('calls the handler on user input', () => {
    const onUserInputSpy = jest.fn()
    render(
      <ResizingTextArea
        className="testing"
        value=""
        onUserInput={onUserInputSpy}
        placeholder="Test Placeholder"
        fontSize="12"
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Test Placeholder'), { target: { value: 'New value' } })

    expect(onUserInputSpy).toHaveBeenCalledWith('New value')
    expect(onUserInputSpy).toHaveBeenCalledTimes(1)
  })
})
