import * as React from 'react';

const style = {
  color: '#ececee',
  padding: '7px 16px',
  borderRadius: '4px',
  border: 'solid 1px #ececee',
  background: 'none',
  marginTop: '20px',
};

const flavors = {
  gold: {
    color: '#f5c400',
    border: 'solid 1px #f5c400',
  },
};

const Button = ({
  disabled = false,
  text,
  type = 'button',
  onClick,
  flavor,
}) => {
  const styles = {
    ...style,
    ...(flavor && flavors[flavor]),
  };
  return (
    <button style={styles} disabled={disabled} type={type} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
