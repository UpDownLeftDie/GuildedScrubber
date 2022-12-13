import * as React from 'react';

const Button = ({ disabled = false, text, onClick }) => {
  return (
    <button disabled={disabled} type="button" onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
