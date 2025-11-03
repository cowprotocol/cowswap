import styled from 'styled-components/macro'

// Minimal structural styles to keep early slices compiling; replaced with
// full design tokens in later branches of the affiliate UI stack.
export const ModalContainer = styled.div``
export const Body = styled.div``
export const Illustration = styled.div``
export const Subtitle = styled.p``
export const FormGroup = styled.form``
export const LabelRow = styled.div``
export const Label = styled.label``
export const TagGroup = styled.div``
export const EditButton = styled.button``
export const InputWrapper = styled.div<{ hasError?: boolean; disabled?: boolean }>
  ``
export const StyledInput = styled.input``
export const TrailingActions = styled.div``
export const InlineAction = styled.button<{ emphasis?: 'normal' | 'danger' }>
  ``
export const StatusMessage = styled.div``
export const SpinnerRow = styled.div``
export const Footer = styled.div``
export const HelperText = styled.div``
export const InlineAlert = styled.div<{ bannerType?: unknown }>
  ``
export const ErrorInline = styled.div<{ bannerType?: unknown }>
  ``
export const LinkedLock = styled.div``
export const TrailingIcon = styled.div<{ kind?: 'error' | 'lock' }>
  ``
