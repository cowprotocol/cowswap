import IMG_CLOSE_ICON from '@cowprotocol/assets/cow-swap/x.svg'
import { SearchInput } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

interface HookSearchInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  ariaLabel?: string
  style?: React.CSSProperties
  onClear?: () => void
}

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  padding: 0 10px;
`

const ButtonIcon = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.8;
  }
`

const ClearButton = styled(ButtonIcon)`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.4;
  transition: all 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }

  > svg {
    width: 14px;
    height: 14px;
    color: inherit;
  }

  > svg > path {
    fill: currentColor;
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HookSearchInput({
  value,
  onChange,
  placeholder = 'Search hooks...',
  ariaLabel = 'Search hooks',
  onClear,
}: HookSearchInputProps) {
  return (
    <SearchContainer>
      <SearchInput
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        style={{ paddingRight: '38px' }}
      />
      {value && (
        <ClearButton onClick={onClear} aria-label="Clear search input">
          <SVG src={IMG_CLOSE_ICON} />
        </ClearButton>
      )}
    </SearchContainer>
  )
}
