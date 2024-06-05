import type * as CSS from 'csstype';
import { MouseEventHandler } from "react";

const style: CSS.Properties = {
  color: "#ececee",
  padding: "7px 16px",
  borderRadius: "4px",
  border: "solid 1px #ececee",
  background: "none",
  marginTop: "20px",
  fontWeight: "bold",
};

export type FlavorsKey = keyof typeof flavors;
const flavors = {
  gold: {
    color: "#f5c400",
    border: "solid 1px #f5c400",
  },
  goldSolid: {
    boxShadow: "0 0 6px 0 rgb(255 234 0 / 50%)",
    border: "solid 1px gold",
    color: "#1d1f24",
    background: "#e4c519",
    backgroundImage: " linear-gradient(to right, #ffb400, #e4c519, #edd75c)",
    backgroundSize: "200% 100%",
    backgroundPosition: "0 0",
  },
  disabled: {
    color: "#ababab",
    border: "solid 1px #ababab",
    boxShadow: "none",
    background: "#333333",
    backgroundImage: "none",
    backgroundSize: "initial",
    backgroundPosition: "initial",
  },
};

interface ButtonProps {
  disabled?: boolean;
  text: string;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  flavor?: FlavorsKey;
  customStyle?: CSS.Properties;
}
const Button = ({ disabled = false, text, type = "button", onClick, flavor, customStyle = {} }: ButtonProps) => {
  const styles = {
    ...style,
    ...(flavor && flavors[flavor]),
    ...customStyle,
    ...(disabled && flavors.disabled),
  };
  return (
    <button style={styles} disabled={disabled} type={type} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
