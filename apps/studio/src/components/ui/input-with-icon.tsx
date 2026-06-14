import type { ReactNode } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@elcokiin/ui/input-group";

type InputWithIconProps = {
  icon: ReactNode;
} & React.ComponentProps<typeof InputGroupInput>;

export function InputWithIcon({ icon, ...props }: InputWithIconProps) {
  return (
    <InputGroup>
      <InputGroupInput {...props} />
      <InputGroupAddon align="inline-start">
        {icon}
      </InputGroupAddon>
    </InputGroup>
  );
}

type TextareaWithIconProps = {
  icon: ReactNode;
} & React.ComponentProps<typeof InputGroupTextarea>;

export function TextareaWithIcon({ icon, ...props }: TextareaWithIconProps) {
  return (
    <InputGroup>
      <InputGroupTextarea {...props} />
      <InputGroupAddon align="block-start">
        {icon}
      </InputGroupAddon>
    </InputGroup>
  );
}
