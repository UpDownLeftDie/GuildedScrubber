import * as React from 'react';

const Input = ({ label, placeholder, value, onChange, maxLength = 190 }) => {
  return (
    <>
      <label htmlFor={`${label}-input`}>{label}: </label>
      <input
        id={`${label}-input`}
        value={value}
        placeholder={placeholder}
        type="text"
        onChange={onChange}
        maxLength={maxLength}
      />
    </>
  );
};

export default Input;
