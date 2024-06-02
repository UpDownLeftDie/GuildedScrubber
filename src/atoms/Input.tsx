import { ChangeEvent, FocusEvent, HTMLInputTypeAttribute } from "react";

interface InputProps {
  label: string;
  placeholder?: string;
  value: string;
  required?: boolean;
  onChange?: Function;
  onBlur?: Function;
  maxLength?: number;
  minLength?: number;
  disabled?: boolean;
  type?: HTMLInputTypeAttribute;
}
const Input = ({
  label,
  placeholder,
  value,
  required = false,
  onChange,
  onBlur,
  maxLength,
  minLength,
  disabled,
  type = "text",
}: InputProps) => {
  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onChange?.(value);
  };

  const handleOnBlur = (event: FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onBlur?.(value);
  };

  const forId = `${label.split(" ").join("")}-input`;
  return (
    <>
      <label htmlFor={forId}>{label}: </label>
      <input
        id={forId}
        value={value}
        placeholder={placeholder}
        type={type}
        required={required}
        onChange={handleOnChange}
        onBlur={handleOnBlur}
        maxLength={maxLength}
        minLength={minLength}
        disabled={disabled}
      />
    </>
  );
};

export default Input;
