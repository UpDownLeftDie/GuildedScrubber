import React from "react";
import { Input, Button } from "../atoms";

const style = {
  display: "flex",
  flexDirection: "column",
};

const InputWithSubmit = (props) => {
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
        onChange={inputOnChange}
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
