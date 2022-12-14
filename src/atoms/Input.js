import * as React from 'react';

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  maxLength,
  minLength,
  disabled,
  type = 'text',
}) => {
  const handleOnChange = (e) => {
    const value = e.target.value;
    onChange?.(value);
  };

  const handleOnBlur = (e) => {
    const value = e.target.value;
    onBlur?.(value);
  };

  const forId = `${label.split(' ').join('')}-input`;
  return (
    <>
      <label htmlFor={forId}>{label}: </label>
      <input
        id={forId}
        value={value}
        placeholder={placeholder}
        type={type}
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
