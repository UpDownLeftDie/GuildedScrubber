import { GSButton } from "@/atoms";
import { Input } from "@nextui-org/react";
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
  submitFlavor?: string;
  style?: CSS.Properties;
  isLoading: boolean;
}
const InputWithSubmit = (props: props) => {
  const {
    inputLabel,
    inputValue,
    inputOnChange,
    inputPlaceholder,
    inputDisabled = false,
    inputMaxLength,
    isLoading = false,
  } = props;
  const { submitDisabled = false, submitText, submitOnClick, submitFlavor } = props;

  return (
    <div className="space-y-4" style={{ ...style, ...props.style }}>
      <Input
        label={inputLabel}
        value={inputValue}
        onValueChange={inputOnChange}
        placeholder={inputPlaceholder}
        disabled={inputDisabled}
        maxLength={inputMaxLength}
      />
      <GSButton
        color="gold"
        type="submit"
        isLoading={isLoading}
        isDisabled={submitDisabled}
        onClick={submitOnClick}
      >
        {submitText}
      </GSButton>
    </div>
  );
};
export default InputWithSubmit;
