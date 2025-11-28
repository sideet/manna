import { ChangeEventHandler } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <label className="relative inline-block w-68 h-36 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute w-0 h-0 opacity-0"
      />
      <span
        className={`absolute top-0 left-0 w-68 h-36 rounded-full transition-all duration-[400ms] ease-in-out ${
          checked
            ? "bg-blue-500 inset-shadow-blue"
            : "bg-gray-200 inset-shadow-gray"
        }`}
      >
        <span
          className={`absolute top-3 left-3 w-30 h-30 bg-white rounded-full transition-all duration-[400ms] ease-in-out shadow-sm ${
            checked ? "translate-x-32" : "translate-x-0"
          }`}
        />
      </span>
    </label>
  );
}
