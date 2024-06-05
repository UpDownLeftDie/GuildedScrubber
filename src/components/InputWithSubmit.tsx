import { Button } from "@/atoms";
import { FlavorsKey } from "@/atoms/Button";
import { Input } from "@nextui-org/input";
import type * as CSS from "csstype";
import { MouseEventHandler } from "react";

const style = {
  display: "flex",
  flexDirection: "column" as const,
};

interface props {
  inputLabel: string;
  inputValue: string;
  inputOnChange: (value: string) => void;
  inputPlaceholder: string;
  inputDisabled?: boolean;
  inputMaxLength: number;
  submitDisabled?: boolean;
  submitText: string;
  submitOnClick: MouseEventHandler<HTMLButtonElement>;
  submitFlavor?: FlavorsKey;
  style?: CSS.Properties;
}
const InputWithSubmit = (props: props) => {
  const {
    inputLabel,
    inputValue,
    inputOnChange,
    inputPlaceholder,
    inputDisabled = false,
    inputMaxLength,
  } = props;
  const { submitDisabled = false, submitText, submitOnClick, submitFlavor } = props;

  return (
    <div style={{ ...style, ...props.style }}>
      <Input
        label={inputLabel}
        value={inputValue}
        onValueChange={inputOnChange}
        placeholder={inputPlaceholder}
        disabled={inputDisabled}
        maxLength={inputMaxLength}
      />
      <Button
        disabled={submitDisabled}
        text={submitText}
        onClick={submitOnClick}
        flavor={submitFlavor}
      />
    </div>
  );
};
export default InputWithSubmit;
