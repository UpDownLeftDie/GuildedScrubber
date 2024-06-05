import * as React from 'react';

const Checkbox = ({ label, checked, id, onChange, disabled }) => {
  return (
    <>
      <input
        id={id}
        name={label}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        value={id}
      />
      <label htmlFor={id}>{label}</label>
    </>
  );
};

export default Checkbox;
