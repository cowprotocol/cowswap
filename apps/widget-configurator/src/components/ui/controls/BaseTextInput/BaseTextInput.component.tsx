import { TextField, TextFieldProps } from "@mui/material";
import { ReactNode } from "react";

export interface BaseTextInputProps extends Omit<TextFieldProps, 'fullWidth' | 'margin' | 'size'> {
  name: string;
  label: string;
}

export function BaseTextInput(props: BaseTextInputProps): ReactNode {
  return (
    <TextField
      { ...props }
      fullWidth
      margin="dense"
      size="medium" />
  )
}
