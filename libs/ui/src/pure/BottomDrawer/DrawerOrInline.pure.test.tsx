import { Fragment, ReactElement, ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'

import { BottomDrawer, BottomDrawerProps } from './BottomDrawer.pure'
import { DrawerOrInline } from './DrawerOrInline.pure'

import { Media } from '../../consts'

jest.mock('@cowprotocol/common-hooks', () => ({
  useMediaQuery: jest.fn(),
}))

jest.mock('./BottomDrawer.pure', () => ({
  BottomDrawer: jest.fn(() => null),
}))

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>

describe('DrawerOrInline', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the full-screen drawer at the up-to-large breakpoint', () => {
    mockUseMediaQuery.mockReturnValue(true)
    const onOpenChange = jest.fn()
    const content = <span>Content</span>

    const result = DrawerOrInline({
      isOpen: true,
      onOpenChange,
      title: 'Orders',
      className: 'orders-drawer',
      header: <span>Header</span>,
      footer: <span>Footer</span>,
      fullScreen: true,
      children: content,
    }) as ReactElement<BottomDrawerProps>

    expect(mockUseMediaQuery).toHaveBeenCalledWith(Media.upToLarge(false))
    expect(result.type).toBe(BottomDrawer)
    expect(result.props).toEqual(
      expect.objectContaining({
        open: true,
        onOpenChange,
        title: 'Orders',
        className: 'orders-drawer',
        fullScreen: true,
      }),
    )
    expect(result.props.children).toBe(content)
  })

  it('renders header, content, and footer inline above the large breakpoint', () => {
    mockUseMediaQuery.mockReturnValue(false)
    const header = <span>Header</span>
    const content = <span>Content</span>
    const footer = <span>Footer</span>

    const result = DrawerOrInline({
      isOpen: true,
      onOpenChange: jest.fn(),
      header,
      footer,
      fullScreen: true,
      children: content,
    }) as ReactElement<{ children: ReactNode[] }>

    expect(mockUseMediaQuery).toHaveBeenCalledWith(Media.upToLarge(false))
    expect(result.type).toBe(Fragment)
    expect(result.props.children).toEqual([header, content, footer])
  })
})
