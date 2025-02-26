import { faClock } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Placement } from '@popperjs/core'
import { Tooltip } from 'components/Tooltip'
import { formatDistanceToNowStrict, format } from 'date-fns'
import { usePopperOnClick } from 'hooks/usePopper'
import styled from 'styled-components/macro'

const IconWrapper = styled(FontAwesomeIcon)`
  &:hover {
    cursor: pointer;
  }
`

interface DateDisplayProps {
  date: Date
  showIcon?: boolean
  tooltipPlacement?: Placement
}

export function DateDisplay({ date, showIcon, tooltipPlacement = 'top' }: Readonly<DateDisplayProps>): React.ReactNode {
  const { tooltipProps, targetProps } = usePopperOnClick<HTMLInputElement>(tooltipPlacement)
  const distance = formatDistanceToNowStrict(date, { addSuffix: true })
  const fullLocaleBased = format(date, 'P pp zzzz')
  const previewDate = format(date, 'dd/MM/yyyy - h:mma')

  return (
    <>
      <Tooltip {...tooltipProps}>
        {distance} - {fullLocaleBased}
      </Tooltip>

      <span>
        {showIcon ? (
          <span {...targetProps}>
            <span>
              <IconWrapper icon={faClock} />
            </span>
            &nbsp;{previewDate}
          </span>
        ) : (
          <span {...targetProps}>{previewDate}</span>
        )}
      </span>
    </>
  )
}
