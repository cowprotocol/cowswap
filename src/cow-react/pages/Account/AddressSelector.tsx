import { useCallback, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { Check, ChevronDown } from 'react-feather'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useWeb3React } from '@web3-react/core'
import { ensNames } from '@cow/pages/Account/ens'
import { useAffiliateAddress } from 'state/affiliate/hooks'
import { updateAddress } from 'state/affiliate/actions'
import { useAppDispatch } from 'state/hooks'
import { isAddress, shortenAddress } from 'utils'

type AddressSelectorProps = {
  address: string
}

export default function AddressSelector(props: AddressSelectorProps) {
  const { address } = props
  const dispatch = useAppDispatch()
  const selectedAddress = useAffiliateAddress()
  const { chainId, provider } = useWeb3React()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<string[]>([address])
  const toggle = useCallback(() => setOpen((open) => !open), [])
  const node = useRef<HTMLDivElement>(null)
  useOnClickOutside(node, open ? toggle : undefined)

  const tryShortenAddress = useCallback((item?: string) => {
    if (!item) {
      return item
    }

    try {
      return shortenAddress(item)
    } catch (error: any) {
      return item
    }
  }, [])

  const handleSelectItem = useCallback(
    (item: string) => {
      dispatch(updateAddress(item))
      toggle()
    },
    [dispatch, toggle]
  )

  useEffect(() => {
    if (!chainId) {
      return
    }

    ensNames(chainId, address).then((response) => {
      if ('error' in response) {
        console.info(response.error)
        setItems([address])
        return
      }
      setItems([...response, address])
    })
  }, [address, chainId])

  useEffect(() => {
    // if the user switches accounts, reset the selected address
    const switchedAccounts = isAddress(selectedAddress) && selectedAddress !== address
    if (switchedAccounts || !selectedAddress) {
      dispatch(updateAddress(address))
      return
    }

    // the selected address is a ens name, verify that resolves to the correct address
    const verify = async () => {
      const resolvedAddress = await provider?.resolveName(selectedAddress)
      if (resolvedAddress !== address) {
        dispatch(updateAddress(address))
      }
    }

    verify()
  }, [selectedAddress, address, dispatch, provider])

  return (
    <>
      {items.length === 1 ? (
        <strong>{tryShortenAddress(address)}</strong>
      ) : (
        <Wrapper ref={node}>
          <AddressInfo onClick={toggle}>
            <span style={{ marginRight: '2px' }}>{tryShortenAddress(selectedAddress)}</span>
            <ChevronDown size={16} style={{ marginTop: '2px' }} strokeWidth={2.5} />
          </AddressInfo>
          {open && (
            <MenuFlyout>
              {items.map((item) => (
                <ButtonMenuItem key={item} $selected={item === ''} onClick={() => handleSelectItem(item)}>
                  <GreenCheck size={16} strokeWidth={2.5} $visible={item === selectedAddress} />{' '}
                  {tryShortenAddress(item)}
                </ButtonMenuItem>
              ))}
            </MenuFlyout>
          )}
        </Wrapper>
      )}
    </>
  )
}

const Wrapper = styled.div`
  position: relative;
  display: inline;
  margin-right: 0.4rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: end;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 0.5rem 0 0;
    width: initial;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const MenuFlyout = styled.span`
  background-color: ${({ theme }) => theme.bg4};
  border: 1px solid ${({ theme }) => theme.bg0};

  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.3rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  left: 0;
  top: 1.75rem;
  z-index: 100;
  min-width: 350px;
  ${({ theme }) => theme.mediaWidth.upToMedium`;
    min-width: 145px
  `};

  > {
    padding: 12px;
  }
`
const MenuItem = css`
  align-items: center;
  background-color: transparent;
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
  display: flex;
  flex: 1;
  flex-direction: row;
  font-size: 16px;
  font-weight: 400;
  justify-content: start;
  :hover {
    text-decoration: none;
  }
`

export const AddressInfo = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.bg4};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.bg0};
  color: ${({ theme }) => theme.text1};
  display: inline-flex;
  flex-direction: row;
  font-weight: 700;
  font-size: 12px;
  height: 100%;
  margin: 0 0.4rem;
  padding: 0.2rem 0.4rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    border: 1px solid ${({ theme }) => theme.bg3};
  }
`
const ButtonMenuItem = styled.button<{ $selected?: boolean }>`
  ${MenuItem}
  cursor: ${({ $selected }) => ($selected ? 'initial' : 'pointer')};
  border: none;
  box-shadow: none;
  color: ${({ theme, $selected }) => ($selected ? theme.text2 : theme.text1)};
  background-color: ${({ theme, $selected }) => $selected && theme.primary1};
  outline: none;
  font-weight: ${({ $selected }) => ($selected ? '700' : '500')};
  font-size: 12px;
  text-transform: lowercase;
  padding: 6px 10px 6px 5px;

  ${({ $selected }) => $selected && `margin: 3px 0;`}

  > ${AddressInfo} {
    margin: 0 auto 0 8px;
  }

  &:hover {
    color: ${({ theme, $selected }) => !$selected && theme.text1};
    background: ${({ theme, $selected }) => !$selected && theme.bg4};
  }

  transition: background 0.13s ease-in-out;
`

const GreenCheck = styled(Check)<{ $visible: boolean }>`
  margin-right: 5px;
  color: ${({ theme }) => theme.success};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
`
