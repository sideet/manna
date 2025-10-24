interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckBox({
  checked,
  onChange,
  ...props
}: CheckBoxProps) {
  return (
    <div
      className={`w-22 h-22 rounded-full cursor-pointer flex items-center justify-center ${
        checked ? "bg-blue-500" : "bg-gray-100 stroke-gray-200"
      }`}
    >
      <input
        type="checkbox"
        onChange={onChange}
        {...props}
        className={`relative w-0 h-0 opacity-0`}
      />
      <svg
        width="11"
        height="8"
        viewBox="0 0 11 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${checked ? "stroke-white" : "stroke-gray-400"}`}
      >
        <path d="M1 3L4.5 6.5L10 1" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
