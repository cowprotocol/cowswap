import { createStore, Provider } from 'jotai'
import { createElement, type ReactNode } from 'react'

import { renderHook } from '@testing-library/react'
import { appSignerAccountAtom, appSignerAtom } from 'cowSdk'

import { useAppSignerForAccount } from './useAppSigner'

jest.mock('cowSdk', () => {
  const { atom } = jest.requireActual('jotai')

  return { appSignerAtom: atom(undefined), appSignerAccountAtom: atom(undefined) }
})

const ACCOUNT = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
const OTHER_ACCOUNT = '0x2222222222222222222222222222222222222222'
const SIGNER = { name: 'signer' }

function renderWithSigner(account: string | undefined, signerAccount: string | undefined): unknown {
  const store = createStore()
  store.set(appSignerAtom, SIGNER)
  store.set(appSignerAccountAtom, signerAccount)

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => createElement(Provider, { store }, children)

  return renderHook(() => useAppSignerForAccount(account), { wrapper }).result.current
}

describe('useAppSignerForAccount', () => {
  it('returns the signer when it signs for the account', () => {
    expect(renderWithSigner(ACCOUNT, ACCOUNT.toUpperCase().replace('0X', '0x'))).toBe(SIGNER)
  })

  it('returns undefined when the signer belongs to another account', () => {
    expect(renderWithSigner(ACCOUNT, OTHER_ACCOUNT)).toBeUndefined()
  })

  it('returns undefined when the signer is not restored yet', () => {
    expect(renderWithSigner(ACCOUNT, undefined)).toBeUndefined()
  })

  it('returns undefined when no account is connected', () => {
    expect(renderWithSigner(undefined, ACCOUNT)).toBeUndefined()
  })
})
