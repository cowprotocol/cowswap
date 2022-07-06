import Tooltip, { TooltipProps } from 'components/Tooltip/TooltipMod'

type FollowingTxPopupProps = Omit<TooltipProps, 'text'>

const PopupContent = () => {
  return (
    <>
      <div>Icon</div>
      <div>
        <p>Text content</p>
        <span>check</span>
      </div>
    </>
  )
}

export default function FollowPendingTxPopup({ show, children, ...rest }: FollowingTxPopupProps): JSX.Element {
  return (
    <Tooltip show={show} placement="bottom" text={<PopupContent />} {...rest}>
      {children}
    </Tooltip>
  )
}
