import { ChangeEventHandler } from "react";
interface CheckboxProps {
  label: string;
  checked: boolean;
  id?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
}
const Checkbox = ({ label, checked, id, onChange, disabled }: CheckboxProps) => {
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
